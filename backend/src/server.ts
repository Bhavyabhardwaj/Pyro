import app from "./app";
import { PORT } from "./config";

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default server;
