import Banner from "@/components/Banner";
import FeaturedFacilities from "@/components/FeaturedFacilities";
import PopularStudios from "@/components/PopularStudios";
import { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Banner></Banner>
      <PopularStudios></PopularStudios>
      <Suspense
        fallback={
          <div className="py-20 text-center">
            Loading featured facilities...
          </div>
        }
      >
        <FeaturedFacilities />
      </Suspense>
    </div>
  );
};

export default page;
