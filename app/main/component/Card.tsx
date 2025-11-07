import React, { memo } from "react";
import Image from "next/image";
import { Product } from "../../type/type";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

interface CardTanProps {
  product: Product;
  variants?: Variants;
}

const CardTan = memo(function CardTan({ product, variants }: CardTanProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        variants={variants}
        className="border rounded-2xl cursor-pointer min-h-[300px] flex flex-col justify-between items-center text-center"
      >
        <div className="flex flex-col items-center text-center">
          {product.images && product.images[0] && (
            <div className="relative w-full h-48 sm:h-60 mx-auto">
              <Image
                src={product.thumbnail}
                alt={product.title}
                layout="fill"
                objectFit="cover"
              />
            </div>
          )}
          <div className="break-words whitespace-normal">{product.title}</div>
          <p>${product.price}</p>
          <p>Rating: {product.rating}</p>
        </div>
      </motion.div>
    </Link>
  );
});

export default CardTan;
