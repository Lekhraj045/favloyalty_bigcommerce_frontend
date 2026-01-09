"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import { useWidgetCustomization } from "../context/WidgetCustomizationContext";
import "swiper/css";
import "swiper/css/pagination";

export default function AnnouncementsSliderArea() {
  const { state } = useWidgetCustomization();
  
  // Filter only enabled announcements
  const enabledAnnouncements = state.announcements.filter(
    (announcement) => announcement.enable
  );

  // If no enabled announcements, don't show the slider
  if (enabledAnnouncements.length === 0) {
    return null;
  }

  // Get image source based on image type
  const getImageSrc = (image: string | null) => {
    if (!image) {
      return `${process.env.NEXT_PUBLIC_BASE_PATH}/images/default_announcement.jpg`;
    }
    
    // Check if it's a base64 data URL
    if (image.startsWith("data:")) {
      return image;
    }
    
    // Check if it's an external URL
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    
    // Otherwise, treat it as a local filename
    return `${process.env.NEXT_PUBLIC_BASE_PATH}/images/${image}`;
  };

  return (
    <>
      <div className="w-full">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{
            clickable: true,
            bulletClass: "swiper-pagination-bullet",
            bulletActiveClass: "swiper-pagination-bullet-active",
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={enabledAnnouncements.length > 1}
          className="announcements-swiper"
        >
          {enabledAnnouncements.map((announcement, index) => {
            const imageSrc = getImageSrc(announcement.image);
            
            return (
              <SwiperSlide key={announcement._id || index}>
                <div className="w-full h-[120px] relative rounded-lg overflow-hidden cursor-pointer">
                  {imageSrc.startsWith("data:") || imageSrc.startsWith("http://") || imageSrc.startsWith("https://") ? (
                    // Use regular img tag for base64 or external URLs
                    <img
                      src={imageSrc}
                      alt={`Announcement ${index + 1}`}
                      className="h-full w-full object-cover"
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    // Use Next.js Image for local files
                    <Image
                      src={imageSrc}
                      alt={`Announcement ${index + 1}`}
                      fill
                      className="h-full w-full object-cover"
                      priority={index === 0}
                    />
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <style jsx global>{`
        .announcements-swiper .swiper-pagination {
          position: inherit;
          bottom: inherit;
        }
        .announcements-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #DEDEDE;
          opacity: 1;
          margin: 0 4px;
        }
        .announcements-swiper .swiper-pagination-bullet-active {
          background: #392D5D;
        }
      `}</style>
    </>
  );
}
