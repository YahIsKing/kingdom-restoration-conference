import Image from "next/image";
import RegistrationForm from "@/components/RegistrationForm";
import SpotsBadge from "@/components/SpotsBadge";

const SPEAKERS = [
  { name: "Abrie Kilian", role: "Keynote Speaker", image: null },
  { name: "Rochagne Kilian", role: "Keynote Speaker", image: null },
  { name: "Peter G Rambo", role: "Keynote Speaker", image: null },
  { name: "Jonathan Bennett", role: "Speaker", image: null },
];

const SCHEDULE = [
  {
    day: "Thursday",
    hebrewDay: "Yom Chamishi",
    date: "July 9",
    events: [
      { time: "5:00 PM", title: "Welcome & Social Networking" },
      { time: "7:00 PM", title: "Worship, Prayer & Keynote" },
    ],
  },
  {
    day: "Friday",
    hebrewDay: "Yom Shishi",
    date: "July 10",
    events: [
      { time: "9:00 AM", title: "Worship & Prayer" },
      { time: "9:30 AM", title: "Morning Session" },
      { time: "1:00 PM", title: "Small Group Discussions" },
      { time: "6:30 PM", title: "Kol Israel Dinner (Coat & Tie)" },
    ],
  },
  {
    day: "Shabbat",
    hebrewDay: "Yom HaShabbat",
    date: "July 11",
    events: [
      { time: "9:00 AM", title: "Prayer, Worship & Torah Study" },
      { time: "2:00 PM", title: "Panel Discussion" },
      { time: "8:00 PM", title: "Evening Session" },
    ],
  },
  {
    day: "Sunday",
    hebrewDay: "Yom Rishon",
    date: "July 12",
    events: [{ time: "9:00 AM", title: "Closing Session" }],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-royal min-h-[60vh] flex flex-col items-center justify-center px-6 py-20">
        <Image
          src="/Kingdom Restoration Logo-04.svg"
          alt="Kingdom Restoration Conference"
          width={600}
          height={600}
          className="w-full max-w-sm sm:max-w-md lg:max-w-lg"
          priority
        />
      </section>

      {/* Event Details Bar */}
      <section className="bg-beige py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="text-2xl sm:text-3xl font-heading text-royal tracking-wide">
              July 9-12, 2026
            </p>
            <p className="mt-1 text-royal/70">
              Hilton Knoxville Airport &bull; Alcoa, TN
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <SpotsBadge />
            <a
              href="#register"
              className="bg-royal hover:bg-royal-light text-beige px-8 py-3 rounded-full font-semibold transition-all hover:shadow-lg"
            >
              Register Now
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl text-royal mb-8">
            Our Vision
          </h2>
          <p className="text-lg sm:text-xl text-royal/80 leading-relaxed">
            Nothing is more frequently prophesied in Scripture than the restoration
            of the Kingdom—not even the coming of the Messiah. Our purpose is not to
            force the Restoration, but to prepare.
          </p>
          <p className="mt-6 text-lg sm:text-xl text-royal/80 leading-relaxed">
            Join us as we gather and equip patriarchs and their families as building
            blocks that become small clans. Those clans will grow into tribes and
            networked fellowships across the world.
          </p>
        </div>
      </section>

      {/* Speakers */}
      <section className="py-20 sm:py-28 px-6 bg-beige">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl text-royal text-center mb-16">
            Speakers
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {SPEAKERS.map((speaker) => (
              <div key={speaker.name} className="text-center">
                <div className="aspect-square bg-royal/10 rounded-2xl mb-4 flex items-center justify-center overflow-hidden">
                  {speaker.image ? (
                    <Image
                      src={speaker.image}
                      alt={speaker.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-16 h-16 text-royal/30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="font-heading text-lg sm:text-xl text-royal">
                  {speaker.name}
                </h3>
                <p className="text-olive text-sm mt-1">{speaker.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl text-royal text-center mb-16">
            Schedule
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {SCHEDULE.map((day) => (
              <div key={day.day}>
                <div className="mb-4">
                  <h3 className="font-heading text-xl text-royal">{day.day}</h3>
                  <p className="text-olive/60 text-xs italic">{day.hebrewDay}</p>
                  <p className="text-olive text-sm mt-1">{day.date}</p>
                </div>
                <div className="space-y-4">
                  {day.events.map((event, index) => (
                    <div key={index} className="border-l-2 border-olive/30 pl-4">
                      <p className="text-sm text-olive font-medium">{event.time}</p>
                      <p className="text-royal/80">{event.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Venue */}
      <section className="py-20 sm:py-28 px-6 bg-royal text-beige">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl mb-8">
            Venue
          </h2>
          <p className="text-xl sm:text-2xl mb-2">
            Hilton Knoxville Airport
          </p>
          <p className="text-beige/70 mb-10">
            Alcoa, Tennessee
          </p>
          <a
            href="https://groups.hilton.com/search-events/ca24f4c7-9edd-4c66-8337-d113947a321d/property/28838b5e-80d3-4ac3-a671-9e6f3f65a64c?search_type=redirect"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-2 border-beige text-beige hover:bg-beige hover:text-royal px-8 py-3 rounded-full font-semibold transition-all"
          >
            Book Your Room
          </a>
        </div>
      </section>

      {/* Registration */}
      <section id="register" className="py-20 sm:py-28 px-6">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl text-royal mb-4">
              Register
            </h2>
            <p className="text-royal/60">
              Seating limited to 200 attendees
            </p>
          </div>
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm">
            <RegistrationForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-royal py-12 px-6 text-beige">
        <div className="max-w-4xl mx-auto text-center">
          <Image
            src="/Kingdom Restoration Logo-07.svg"
            alt="Kingdom Restoration Conference"
            width={300}
            height={300}
            className="mx-auto w-48 sm:w-56"
          />
          <p className="mt-6 text-beige/60 text-sm">
            &copy; {new Date().getFullYear()} Kingdom Restoration Conference
          </p>
        </div>
      </footer>
    </div>
  );
}
