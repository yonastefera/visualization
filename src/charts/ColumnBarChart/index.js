import {horizontalBarChart} from "./columnChart";


export default (selector) => {
    let update;
    return {
        render: (data) => {
            const container = document.querySelector(selector);
            const width = container.offsetWidth;
            update = horizontalBarChart({
                width,
                height: 0.5 * width,
                selector,
                data,
            });
        },
        update: (data) => {
            const container = document.querySelector(selector);
            const width = container.offsetWidth;

            if (update) {
                update({ width, height: 0.5 * width, data });
            }
        },
    };
};
