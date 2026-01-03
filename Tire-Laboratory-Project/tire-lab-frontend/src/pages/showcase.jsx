const products = [
  {
    brand: "Appple",
    email: "mail@rgmail.com",
    image: "https://images.unsplash.com/photo-1613588718956-c2e80305bf61?auto=format&fit=crop&w=634&q=80",
    category: "Technology",
    price: "200.00$",
    status: "available",
    statusColor: "bg-green-400",
  },
  {
    brand: "Realme",
    email: "mail@rgmail.com",
    image: "https://images.unsplash.com/photo-1423784346385-c1d4dac9893a?auto=format&fit=crop&w=1050&q=80",
    category: "Technology",
    price: "200.00$",
    status: "no stock",
    statusColor: "bg-red-400",
  },
  {
    brand: "Samsung",
    email: "mail@rgmail.com",
    image: "https://images.unsplash.com/photo-1600856209923-34372e319a5d?auto=format&fit=crop&w=2135&q=80",
    category: "Technology",
    price: "200.00$",
    status: "start sale",
    statusColor: "bg-yellow-400",
  },
];

const Showcase = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="col-span-12 w-full max-w-6xl px-4">
        <div className="overflow-auto lg:overflow-visible">
          <table className="table-auto text-gray-400 border-separate space-y-6 text-sm w-full">
            <thead className="bg-gray-800 text-gray-500">
              <tr>
                <th className="p-3">Brand</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr className="bg-gray-800" key={index}>
                  <td className="p-3">
                    <div className="flex items-center">
                      <img
                        className="rounded-full h-12 w-12 object-cover"
                        src={product.image}
                        alt={product.brand}
                      />
                      <div className="ml-3">
                        <div>{product.brand}</div>
                        <div className="text-gray-500">{product.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3 font-bold">{product.price}</td>
                  <td className="p-3">
                    <span className={`${product.statusColor} text-gray-50 rounded-md px-2`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <a href="#" className="text-gray-400 hover:text-gray-100 mr-2">
                      <i className="material-icons-outlined text-base">visibility</i>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-gray-100 mx-2">
                      <i className="material-icons-outlined text-base">edit</i>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-gray-100 ml-2">
                      <i className="material-icons-round text-base">delete_outline</i>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Showcase;
