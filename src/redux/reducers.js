export default function(state = {}, action) {
    if (action.type == 'SET_DATA') {
        state = {
            ...state,
            filteredData: action.filteredData,
            filters: action.filters,
            startingDate: action.startingDate,
            endDate: action.endDate
        }
    }
    return state;
}

// dispatch // action // reducer
