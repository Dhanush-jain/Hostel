export default function MessTimetable() {
  const timetable = [
    { day: "Monday", breakfast: "Idli & Sambar", lunch: "Dal Rice", dinner: "Chapati & Paneer" },
    { day: "Tuesday", breakfast: "Poha", lunch: "Rajma Chawal", dinner: "Dosa" },
    { day: "Wednesday", breakfast: "Upma", lunch: "Fried Rice", dinner: "Dal Tadka" },
    { day: "Thursday", breakfast: "Paratha", lunch: "Chole Rice", dinner: "Pasta" },
    { day: "Friday", breakfast: "Bread & Jam", lunch: "Veg Biryani", dinner: "Roti & Mix Veg" },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Weekly Mess Timetable</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Day</th>
            <th className="border p-2">Breakfast</th>
            <th className="border p-2">Lunch</th>
            <th className="border p-2">Dinner</th>
          </tr>
        </thead>
        <tbody>
          {timetable.map((item, i) => (
            <tr key={i} className="text-center">
              <td className="border p-2 font-semibold">{item.day}</td>
              <td className="border p-2">{item.breakfast}</td>
              <td className="border p-2">{item.lunch}</td>
              <td className="border p-2">{item.dinner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
