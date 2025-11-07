import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useMediaQuery from "../lib/useMediaQuery";

interface DropdownProps {
  selectedCategory: string | undefined;
  setSelectedCategory: (category: string) => void;
  categoryData: { name: string }[] | undefined;
}

const Dropdown = memo(function Dropdown({
  selectedCategory,
  setSelectedCategory,
  categoryData,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);
  const slideMenuRef = useRef<HTMLDivElement>(null);
  const outcropRef = useRef<HTMLButtonElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!isMobile && isOpen) return;

      if (
        slideMenuRef.current &&
        !slideMenuRef.current.contains(event.target as Node) &&
        outcropRef.current &&
        !outcropRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscape);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isMobile]);

  const handleSelect = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      setIsOpen(false);
    },
    [setSelectedCategory]
  );

  return (
    <>
      <motion.button
        onClick={() => isMobile && setIsOpen(true)}
        onMouseEnter={() => !isMobile && setIsOpen(true)}
        initial={{ x: 0 }}
        animate={{ x: isOpen ? 64 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-2 rounded-r-md shadow-lg z-50 cursor-pointer"
        style={{ minWidth: "30px", height: "60px" }}
      >
        <span className="sr-only">Открыть фильтры</span>
        &gt;
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 z-50 shadow-lg p-4 pt-16 pb-10 overflow-y-auto"
            onMouseLeave={() => !isMobile && setIsOpen(false)}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 text-xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
              Фильтры
            </h2>

            <div
              className="flex justify-between items-center cursor-pointer py-2 border-b border-gray-200 dark:border-gray-700"
              onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
            >
              <h3 className="text-lg font-semibold dark:text-gray-100">
                Категории
              </h3>
              <motion.span
                animate={{ rotate: isCategoriesExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-gray-500 dark:text-gray-400 text-xl"
              >
                &#9660;
              </motion.span>
            </div>

            <AnimatePresence>
              {isCategoriesExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <ul className="space-y-2 pt-2">
                    <li
                      key="all-categories"
                      onClick={() => handleSelect("")}
                      className={`px-2 py-2 cursor-pointer whitespace-nowrap rounded-md
                        ${
                          !selectedCategory
                            ? "bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100 font-semibold"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }
                      `}
                    >
                      Все
                    </li>
                    {categoryData?.map((cat) => (
                      <li
                        key={cat.name}
                        onClick={() => handleSelect(cat.name)}
                        className={`px-1 py-1 cursor-pointer whitespace-nowrap rounded-md
                          ${
                            selectedCategory === cat.name
                              ? "bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100 font-semibold"
                              : "hover:bg-gray-100 dark:hover:bg-gray-700"
                          }
                        `}
                      >
                        {cat.name}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black z-40"
          />
        )}
      </AnimatePresence>
    </>
  );
});

export default Dropdown;
