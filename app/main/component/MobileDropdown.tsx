import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  setSelectedCategory: (category: string) => void;
  categoryData: { name: string }[] | undefined;
}

const MobileDropdown: React.FC<MobileDropdownProps> = ({
  isOpen,
  onClose,
  setSelectedCategory,
  categoryData,
}) => {
  const handleSelect = (category: string) => {
    setSelectedCategory(category);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 bg-white z-50 flex flex-col p-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Выберите категорию</h2>
            <button onClick={onClose} className="text-2xl font-bold">
              &times;
            </button>
          </div>
          <ul className="flex-grow overflow-y-auto">
            <li
              onClick={() => handleSelect("")}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b"
            >
              Все
            </li>
            {categoryData?.map((cat) => (
              <li
                key={cat.name}
                onClick={() => handleSelect(cat.name)}
                className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b"
              >
                {cat.name}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileDropdown;
