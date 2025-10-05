import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import goodAirQuality from "../imagem/good-air-quality.png";
import moderateAirQuality from "../imagem/moderate-air-quality.png";
import poorAirQuality from "../imagem/poor-air-quality.png";
import notFound from "../imagem/not-found.png";

type AirQuality = "good" | "moderate" | "poor";

interface AirPopupProps {
  airQuality: AirQuality;
  isOpen: boolean;
  onOpenChange: () => void;
}

const tips = [
  {
    title: "Stay Indoors",
    text: "Keep windows closed and use air purifiers if available.",
    category: "Health",
  },
  {
    title: "Avoid Outdoor Exercise",
    text: "Postpone outdoor physical activities until air quality improves.",
    category: "Health",
  },
  {
    title: "Wear a Mask",
    text: "Use N95 or similar masks to filter harmful particles.",
    category: "Health",
  },
  {
    title: "Stay Hydrated",
    text: "Drink plenty of water to help your body flush out pollutants.",
    category: "Health",
  },
  {
    title: "Check Updates",
    text: "Monitor air quality apps for live health alerts.",
    category: "Health",
  },
  {
    title: "Reduce Car Use",
    text: "Prefer walking, biking, or public transportation.",
    category: "Environment",
  },
  {
    title: "Plant Trees",
    text: "Trees absorb pollutants and release clean oxygen.",
    category: "Environment",
  },
  {
    title: "Avoid Burning Trash",
    text: "Burning releases toxic gases that pollute the air.",
    category: "Environment",
  },
  {
    title: "Save Energy",
    text: "Turn off lights and electronics when not in use.",
    category: "Environment",
  },
  {
    title: "Use Renewable Sources",
    text: "Choose solar or wind energy whenever possible.",
    category: "Environment",
  },
];

export function AirTipsCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-16 flex justify-center items-center overflow-hidden bg-gradient-to-r from-blue-50 to-green-50/80 dark:from-gray-800 dark:to-gray-900/80 backdrop-blur-sm rounded-md mt-2 shadow-sm dark:shadow-gray-700/50">
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.8 }}
        className="text-center px-3 max-w-md"
      >
        <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-100 mb-0.5">
          {tips[index].category === "Health" ? "🫁 Health Tip" : "🌿 Eco Tip"}: {tips[index].title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 text-[11px] leading-tight">
          {tips[index].text}
        </p>
      </motion.div>
    </div>
  );
}

export default function AirPopup({ airQuality, isOpen, onOpenChange }: AirPopupProps) {
  const getAirQualityContent = () => {
    switch (airQuality) {
      case "good":
        return {
          title: "Air Quality: Good",
          body: "The air is clean and safe for everyone. Outdoor activities can be done normally without health risks.",
          icon: (
            <img
              src={goodAirQuality}
              alt="Good Air Quality"
              className="w-16 h-16 flex-shrink-0"
            />
          ),
        };
      case "moderate":
        return {
          title: "Air Quality: Moderate",
          body: "The air quality is acceptable, but sensitive groups may experience minor issues. Consider reducing intense outdoor activities if you feel discomfort.",
          icon: (
            <img
              src={moderateAirQuality}
              alt="Moderate Air Quality"
              className="w-16 h-16 flex-shrink-0"
            />
          ),
        };
      case "poor":
        return {
          title: "Air Quality: Poor",
          body: "The air quality is unhealthy, especially for sensitive groups. Avoid outdoor activities and keep indoor spaces well-ventilated.",
          icon: (
            <img
              src={poorAirQuality}
              alt="Poor Air Quality"
              className="w-16 h-16 flex-shrink-0"
            />
          ),
        };
      default:
        return {
          title: "Air Quality: Unavailable",
          body: "No information is available about air quality at the moment.",
          icon: (
            <img
              src={notFound}
              alt="Air Quality Unavailable"
              className="w-16 h-16 flex-shrink-0"
            />
          ),
        };
    }
  };

  const { title, body, icon } = getAirQualityContent();

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="z-[1000]">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
              <ModalBody className="flex flex-row items-start gap-4">
                {icon}
                <p className="flex-1">{body}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <AirTipsCarousel />
    </>
  );
}