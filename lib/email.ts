import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set - emails will not be sent");
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface TShirt {
  size: string;
  color: string;
}

interface ConfirmationEmailData {
  to: string;
  name: string;
  registrationType: "conference" | "vendor";
  amount: string;
  // Optional detailed order info
  tshirts?: TShirt[];
  addOns?: Record<string, number>;
  dietaryPreference?: string;
  allergies?: string;
}

function formatColorLabel(color: string): string {
  const colors: Record<string, string> = {
    royal: "Royal (Navy)",
    olive: "Olive (Green)",
    beige: "Beige (Sand)",
  };
  return colors[color] || color;
}

function buildOrderDetailsHtml(data: ConfirmationEmailData): string {
  const items: string[] = [];

  // Base registration
  items.push(`<li>Family Registration - includes 1 dinner, 1 lunch, 1 t-shirt</li>`);

  // T-shirts
  if (data.tshirts && data.tshirts.length > 0) {
    const tshirtList = data.tshirts
      .map((t, i) => `${t.size} - ${formatColorLabel(t.color)}${i === 0 ? " (included)" : ""}`)
      .join("<br>&nbsp;&nbsp;&nbsp;&nbsp;");
    items.push(`<li><strong>T-Shirts:</strong><br>&nbsp;&nbsp;&nbsp;&nbsp;${tshirtList}</li>`);
  }

  // Add-ons
  if (data.addOns) {
    if (data.addOns["dinner-adult"]) {
      items.push(`<li>Extra Adult Dinner x${data.addOns["dinner-adult"]}</li>`);
    }
    if (data.addOns["dinner-child"]) {
      items.push(`<li>Extra Child Dinner x${data.addOns["dinner-child"]}</li>`);
    }
    if (data.addOns["lunch"]) {
      items.push(`<li>Extra Boxed Lunch x${data.addOns["lunch"]}</li>`);
    }
  }

  // Dietary
  if (data.dietaryPreference) {
    const pref = data.dietaryPreference.charAt(0).toUpperCase() + data.dietaryPreference.slice(1);
    items.push(`<li><strong>Dietary Preference:</strong> ${pref}</li>`);
  }

  if (data.allergies) {
    items.push(`<li><strong>Allergies/Restrictions:</strong> ${data.allergies}</li>`);
  }

  return items.join("\n                ");
}

export async function sendConfirmationEmail(data: ConfirmationEmailData) {
  if (!resend) {
    console.log("Email would be sent to:", data.to);
    return { success: true, mock: true };
  }

  const isVendor = data.registrationType === "vendor";
  const orderDetailsHtml = !isVendor ? buildOrderDetailsHtml(data) : "";

  const { error } = await resend.emails.send({
    from: "Kingdom Restoration Conference <hello@updates.kingdomrestorationconf.com>",
    to: data.to,
    subject: isVendor
      ? "Vendor Table Confirmed - Kingdom Restoration Conference 2026"
      : "Registration Confirmed - Kingdom Restoration Conference 2026",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Georgia, serif; background-color: #F5EFE6; padding: 40px 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

            <div style="background-color: #2C3E50; padding: 30px; text-align: center;">
              <h1 style="color: #E6D5B7; margin: 0; font-size: 24px;">Kingdom Restoration Conference</h1>
              <p style="color: #E6D5B7; margin: 10px 0 0 0; opacity: 0.9;">July 9-12, 2026</p>
            </div>

            <div style="padding: 40px 30px;">
              <h2 style="color: #2C3E50; margin-top: 0;">${isVendor ? "Vendor Table Confirmed!" : "Registration Confirmed!"}</h2>

              <p style="color: #333; line-height: 1.6;">
                Dear ${data.name},
              </p>

              <p style="color: #333; line-height: 1.6;">
                Thank you for ${isVendor ? "reserving a vendor table at" : "registering for"} the Second Annual Kingdom Restoration Conference! We're excited to have you join us.
              </p>

              <div style="background-color: #F5EFE6; border-left: 4px solid #78866B; padding: 20px; margin: 30px 0;">
                <h3 style="color: #2C3E50; margin-top: 0;">Event Details</h3>
                <p style="margin: 5px 0; color: #333;"><strong>Date:</strong> July 9-12, 2026</p>
                <p style="margin: 5px 0; color: #333;"><strong>Location:</strong> Hilton Knoxville Airport, Alcoa, TN</p>
                <p style="margin: 5px 0; color: #333;"><strong>Amount Paid:</strong> ${data.amount}</p>
              </div>

              ${!isVendor ? `
              <div style="background-color: #F5EFE6; border-left: 4px solid #2C3E50; padding: 20px; margin: 30px 0;">
                <h3 style="color: #2C3E50; margin-top: 0;">Your Order</h3>
                <ul style="color: #333; line-height: 1.8; margin: 0; padding-left: 20px;">
                ${orderDetailsHtml}
                </ul>
              </div>
              ` : ""}

              <h3 style="color: #2C3E50;">Hotel Accommodations</h3>
              <p style="color: #333; line-height: 1.6;">
                Book your room at the host hotel using our group rate:
              </p>
              <p style="margin: 20px 0;">
                <a href="https://groups.hilton.com/search-events/ca24f4c7-9edd-4c66-8337-d113947a321d/property/28838b5e-80d3-4ac3-a671-9e6f3f65a64c?search_type=redirect"
                   style="background-color: #78866B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  Book Your Room
                </a>
              </p>

              <h3 style="color: #2C3E50;">What to Expect</h3>
              <ul style="color: #333; line-height: 1.8;">
                <li>Worship and prayer sessions</li>
                <li>Keynote speakers including Abrie Kilian, Rochagne Kilian, Peter G Rambo, and Jonathan Bennett</li>
                <li>Small group discussions</li>
                <li>Kol Israel Dinner (Coat & Tie) on Friday evening</li>
                <li>Torah Study on Shabbat</li>
                <li>Fellowship and networking opportunities</li>
              </ul>

              <p style="color: #333; line-height: 1.6; margin-top: 30px;">
                If you have any questions, please reply to this email.
              </p>

              <p style="color: #333; line-height: 1.6;">
                Shalom,<br>
                <strong>The Kingdom Restoration Conference Team</strong>
              </p>
            </div>

            <div style="background-color: #2C3E50; padding: 20px; text-align: center;">
              <p style="color: #E6D5B7; margin: 0; font-size: 14px; opacity: 0.8;">
                Kingdom Restoration Conference 2026
              </p>
            </div>

          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }

  return { success: true };
}
