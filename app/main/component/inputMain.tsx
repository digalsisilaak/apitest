interface Props {
  inputSearchTerm: string;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSearch: () => void;
  setInputSearchTerm: (a: string) => void;
}
function InputMain({
  inputSearchTerm,
  handleKeyDown,
  handleSearch,
  setInputSearchTerm,
}: Props) {
  return (
    <div className="flex gap-3">
      <input
        type="text"
        placeholder="Поиск продуктов..."
        value={inputSearchTerm}
        onChange={(e) => setInputSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        className="ml-auto p-2 border rounded-md min-w-[150px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
      />
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Найти
      </button>
    </div>
  );
}
export default InputMain;
