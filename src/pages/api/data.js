let data = require("../../../data.json"); // Import data initially

export default function handler(req, res) {
  switch (req.method) {
    case "GET":
      res.status(200).json(data);
      break;
    case "POST":
      // Create new item
      const newItem = { id: Date.now(), ...req.body };
      data.push(newItem);
      res.status(201).json(newItem);
      break;
    case "PUT":
      // Update an item
      const { id, ...updatedItem } = req.body;
      const index = data.findIndex((item) => item.id === id);
      if (index !== -1) {
        data[index] = { ...data[index], ...updatedItem };
        res.status(200).json(data[index]);
      } else {
        res.status(404).json({ message: "Item not found" });
      }
      break;
    case "DELETE":
      // Delete an item
      const { id: deleteId } = req.body;
      const itemIndex = data.findIndex((item) => item.id === deleteId);
      if (itemIndex !== -1) {
        data.splice(itemIndex, 1); // Remove the item from the array
        res.status(200).json({ message: "Item deleted" });
      } else {
        res.status(404).json({ message: "Item not found" });
      }
      break;
    default:
      console.log({ data });
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
}
