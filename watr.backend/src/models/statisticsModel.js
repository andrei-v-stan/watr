import { DataCube } from 'data-cube';

const createStatistic = (label, value) => {
    const cube = new DataCube();
    cube.addObservation({
        dimension: { label },
        measure: { value },
    });
    return cube.toJSONLD();
};

export default { createStatistic };