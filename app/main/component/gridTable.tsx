import { memo } from "react";
import { motion } from "framer-motion";
import { Product } from "../../type/type";
import CardTan from "./Card";
interface GridTableProps {
  data:
    | {
        pages: Array<{ products: Product[] }>;
      }
    | undefined;
}
const GridTable = memo(function GridTable({ data }: GridTableProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {data?.pages
        .flatMap((page) => page.products)
        .map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardTan product={product} />
          </motion.div>
        ))}
    </div>
  );
});

export default GridTable;
