import axios from '../axios'

export function setData(filteredData, filters, startingDate, endDate) {
    return {
        type: 'SET_DATA',
        filteredData,
        filters,
        startingDate,
        endDate
    }
}
