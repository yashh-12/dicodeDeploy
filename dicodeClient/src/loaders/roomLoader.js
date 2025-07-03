import { getRoomDetails } from "../service/room.service";

const roomLoader = async (req,res) => {
    try {
        const {roomId} = req.params;
        const resp = await getRoomDetails(roomId);
        if(resp.success){
            return resp;
        }
        return { status: 400, message: "Something went wrong", success: false };

    } catch (error) {
        return { status: 400, message: "Something went wrong", success: false };

    }
}

export default roomLoader;