import { getPendingRequests } from "../service/friendship.service";

const addFriendsLoader = async () => {
   try {

        const res = await getPendingRequests();
        if(res.success){
            return res;
        }
        return { status: 400, message: "Something went wrong", success: false };

    } catch (error) {
        return { status: 400, message: "Something went wrong", success: false };

    }
}


export default addFriendsLoader