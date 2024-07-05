import moment from "moment";
export const cron = "* * * * *";
export const handler = () => {
    const yesterday = moment().add(-1, "day").toDate();
};
