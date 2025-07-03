import { getAllRooms } from "../service/room.service";

const roomsLoader = async () => {
    try {
        const res = await getAllRooms();
        console.log(res);

        if (res.success) {
            return res;
        }
        return { status: 400, message: "Something went wrong", success: false };
    } catch (error) {
        return { status: 400, message: "Something went wrong", success: false };
    }
}

export default roomsLoader;