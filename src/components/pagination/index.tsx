const Pagination = ({ currentPage, totalPages, onPageChange }: any) => {
  const getPageNumbers = () => {
    const totalPageNumbersToShow = 3;
    const halfWay = Math.floor(totalPageNumbersToShow / 2);
    let startPage = Math.max(0, currentPage - halfWay);
    let endPage = Math.min(totalPages - 1, currentPage + halfWay);

    if (startPage === 0) {
      endPage = Math.min(totalPages - 1, totalPageNumbersToShow - 1);
    } else if (endPage === totalPages - 1) {
      startPage = Math.max(0, totalPages - totalPageNumbersToShow);
    }

    const pages = [];
    if (startPage > 0) {
      pages.push(0);
      if (startPage > 1) {
        pages.push("...");
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages - 1);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <ul className="flex gap-2 p-0 list-none">
      {pageNumbers.map((page, index) => (
        <li key={index} className="flex items-center justify-center">
          {page === "..." ? (
            <span className="px-2 text-gray-500">...</span>
          ) : (
            <button
              className={`h-8 w-8 rounded-md border-[1.5px] border-primaryColor 
               font-medium transition-all duration-300
              ${
                currentPage === page
                  ? "bg-primaryColor text-black"
                  : "hover:bg-primaryColor hover:text-black bg-white/20 text-primaryColor"
              }`}
              onClick={() => typeof page === "number" && onPageChange(page)}
            >
              {typeof page === "number" ? page + 1 : page}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default Pagination;
