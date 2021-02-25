import {barChart} from "./barChart";


export default (selector) => {
    let update;
    return {
        render: (data) => {
            const container = document.querySelector(selector);
            const width = container.offsetWidth;
            update = barChart({
                width,
                height: 0.7 * width,
                selector,
                data,
            });
        },
        update: (data) => {
            const container = document.querySelector(selector);
            const width = container.offsetWidth;

            if (update) {
                update({ width, height: 0.7 * width, data });
            }
        },
    };
};
