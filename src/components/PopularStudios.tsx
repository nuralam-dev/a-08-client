
import Link from "next/link";

const categories = [
  {
    name: "Photography",
    icon: "📸",
    value: "Photo Studio",
    color: "bg-green-50 border-green-100 text-green-700",
  },
  {
    name: "Podcast",
    icon: "🎙️",
    value: "Podcast Lounge",
    color: "bg-yellow-50 border-yellow-100 text-yellow-700",
  },
  {
    name: "Music",
    icon: "🎵",
    value: "Music Suite",
    color: "bg-orange-50 border-orange-100 text-orange-700",
  },
  {
    name: "Film",
    icon: "🎬",
    value: "Film Stage",
    color: "bg-cyan-50 border-cyan-100 text-cyan-700",
  },
  {
    name: "Art",
    icon: "🎨",
    value: "Workshop",
    color: "bg-red-50 border-red-100 text-red-700",
  },
  {
    name: "Workshop",
    icon: "🛠️",
    value: "Workshop",
    color: "bg-blue-50 border-blue-100 text-blue-700",
  },
];

export default function PopularStudios() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Popular Studios
          </h2>

          <p className="mt-3 text-base text-slate-500 md:text-lg">
            Find the perfect creative space for your next project
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/facilities?category=${encodeURIComponent(
                category.value
              )}`}
              className={`
                flex min-h-40 flex-col items-center
                justify-center gap-4 rounded-2xl border
                p-5 text-center transition-all
                duration-300 hover:-translate-y-1
                hover:shadow-md ${category.color}
              `}
            >
              <span className="text-5xl">
                {category.icon}
              </span>

              <h3 className="text-base font-semibold md:text-lg">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
