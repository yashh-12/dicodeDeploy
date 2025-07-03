import { getUserDetails } from "../service/user.service"

const layoutLoader = async () => {
    try {
        const res = await getUserDetails();
        if (res?.success) {
            return res;
        }
        return { status: 400, message: "Something went wrong", success: false };
    } catch (error) {
        return { status: 400, message: "Something went wrong", success: false };
    }
}

export default layoutLoader;