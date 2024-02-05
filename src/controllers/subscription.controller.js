import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { asynchandler } from "../utils/asyncHamdler.js";

const toggleSubscription = asynchandler(async (req, res) => {
    const { channelId } = req.params;
    const { _id } = req.user;
    // TODO: toggle subscription
    if (!channelId) {
        throw new ApiError(500, "channel id is requiered");
    }
    let subscribe = await Subscription.findOneAndDelete({
        $and: [
            {
                channel: channelId,
            },
            { subscriber: _id },
        ],
    });
    if (!subscribe) {
        const subscription = await Subscription.create({
            subscriber: _id,
            channel: channelId,
        });
        if (!subscription) {
            throw new ApiError(500, "something went worng to subscription");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    subscription,
                    "channel successfully subscribered"
                )
            );
    } else {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    subscribe,
                    "channel unsuccessfully subscribered"
                )
            );
    }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asynchandler(async (req, res) => {
    const { channelId } = req.params;
    const subscribersList = await Subscription.find({
        channel: channelId,
    });
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribersList,
                "all channel fected successfully"
            )
        );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asynchandler(async (req, res) => {
    const { subscriberId } = req.params;
    const subscribersList = await Subscription.find({
        subscriber: subscriberId,
    });
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribersList,
                "all channel fected successfully"
            )
        );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
