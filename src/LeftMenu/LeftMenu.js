import React, { Component } from 'react';
import axios from '../axios'
import {Doughnut} from 'react-chartjs-2';
import styled from 'styled-components'
import { setData } from '../redux/actions.js'
import { connect } from 'react-redux';

const mapStateToProps = state => {
    return {}
}
class LeftMenu extends Component {
    constructor(props) {
        super(props)

        this.state = {
            startingDate: null,
            endDate: null,
            menusToDisplay: [],
            dropDownOptions: [
                {
                    text: "Team member",
                    value: "listOfUsers"
                },
                {
                    text: "Action",
                    value: "listOfActions"
                },
                {
                    text: "Parkings",
                    value: "listOfParkings"
                },
                {
                    text: "Date",
                    value: "dates"
                }
            ],
            listOfActions: [
                "MANUAL_MERGE_ENTRY",
                "UPDATE",
                "DELETE",
                "SET_DELETE",
                "INSERT",
                "CHECKED",
                "CHECKED_OPENING_HOURS",
                "CHECKED_PRICE",
            ],
            filters: [
                // SOME NICE FILTERS FOR TESTING STYLING
                // {
                //     text: 'Parking/s',
                //     list: [
                //         "2327104",
                //         "2335221",
                //         "2335916",
                //         "2339327",
                //         "2339427",
                //         "2340994",
                //         "2342378",
                //         "2343166",
                //         "2347828",
                //         "2347993",
                //         "2347994",
                //         "2350931",
                //         "2353350",
                //         "2353356",
                //         "2360903",
                //         "2361677",
                //         "2361692",
                //         "2362149",
                //         "2370559",
                //         "2372818",
                //         "2373068",
                //         "2374603",
                //         "2375970",
                //         "2376216",
                //         "2377081",
                //         "2377217",
                //         "2377638",
                //         "2384157",
                //         "2386459",
                //         "2386866",
                //         "2389453",
                //         "2389648",
                //         "2393770"
                //     ]
                // },
                // {
                //     text: 'Team member/s',
                //     list: [
                //         '2197',
                //         'd912',
                //         'bb78',
                //         'b83d',
                //         '7522',
                //         '555a',
                //         '534b',
                //         '24dd',
                //         'b69e',
                //         '21c9'
                //     ]
                // },
                // {
                //     text: 'Action/s',
                //     list: [
                //         'CHECKED_PRICE',
                //         'SET_DELETE',
                //         'DELETE',
                //         'INSERT',
                //         'CHECKED_OPENING_HOURS',
                //         'CHECKED',
                //         'UPDATE',
                //         'MANUAL_MERGE_ENTRY'
                //     ]
                // }
            ]
        }

        this.handleSelectChange = this.handleSelectChange.bind(this)
        this.setFilter = this.setFilter.bind(this)
        this.removeItemFromList = this.removeItemFromList.bind(this)
        this.closeMenu = this.closeMenu.bind(this)
        this.handleDateChange = this.handleDateChange.bind(this)
        this.setDropDownOptions = this.setDropDownOptions.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }
    componentDidMount(){
        axios.get("/data.json").then(async ({data}) => {
            await this.setState({
                listOfUsers: data.listOfUsers,
                listOfParkings: data.listOfParkings
            })
        })
    }
    componentDidUpdate() {}
    removeItemFromList(text, item) {
        var list
        if (text === "Action/s") {
            list = "listOfActions"
        } else if (text === "Team member/s") {
            list = "listOfUsers"
        } else if (text === "Parking/s") {
            list = "listOfParkings"
        }
        var newList = this.state[list]
        newList.forEach((elem, i) => {
            if (elem === item) {
                newList.splice(i, 1)
            }
        })
        this.setState({ [list]: newList })
    }
    setDropDownOptions() {
        var newDropDownOptions = [
            {
                text: "Team member",
                value: "listOfUsers"
            },
            {
                text: "Action",
                value: "listOfActions"
            },
            {
                text: "Parkings",
                value: "listOfParkings"
            },
            {
                text: "Date",
                value: "dates"
            }
        ]
        var newMenusToDisplay = this.state.menusToDisplay
        if (newMenusToDisplay.length) {
            for (var i = 0; i < newDropDownOptions.length; i++) {
                for (var j = 0; j < newMenusToDisplay.length; j++) {
                    if (newDropDownOptions[i].value === newMenusToDisplay[j]) {
                        newDropDownOptions.splice(i, 1)
                        this.setState({ dropDownOptions: newDropDownOptions, menusToDisplay: newMenusToDisplay })
                    }
                }
            }
        }
    }
    handleSelectChange(e) {
        var newMenusToDisplay = this.state.menusToDisplay
        // newMenusToDisplay.push(e.target.options[e.target.selectedIndex].value)
        newMenusToDisplay = []
        newMenusToDisplay.push(e.target.options[e.target.selectedIndex].value)
        this.setState({ menusToDisplay: newMenusToDisplay, error: false }, () => this.setDropDownOptions())
    }
    async setFilter(text, item) {
        var newFilters = this.state.filters
        if (!newFilters.length) {
            var newFilterObj = {
                text: text,
                list: []
            }
            await newFilterObj.list.push(item)
            await newFilters.push(newFilterObj)
            await this.removeItemFromList(text, item)
        } else {
            var addNewList = true
            for (var i = 0; i < newFilters.length; i++) {
                if (newFilters[i].text === text) {
                    await newFilters[i].list.push(item)
                    await this.removeItemFromList(text, item)
                    addNewList = false
                    break
                }
            }
            if (addNewList) {
                var newFilterObj = {
                    text: text,
                    list: []
                }
                await newFilterObj.list.push(item)
                newFilters.push(newFilterObj)
                await this.removeItemFromList(text, item)
            }
        }
        await this.setState({ filters: newFilters })
    }
    deleteFilter(obj, item) {
        var newFilters = this.state.filters
        for (var i = 0; i < newFilters.length; i++) {
            if (newFilters[i].text === obj.text) {
                for (var j = 0; j < newFilters[i].list.length; j++) {
                    if (newFilters[i].list[j] === item) {
                        newFilters[i].list.splice(j, 1)
                        if (newFilters[i].list.length === 0) {
                            newFilters.splice(i, 1)
                            break
                        }
                    }
                }
            }
        }
        this.setState({ filters: newFilters })
    }
    closeMenu(menu) {
        var newDropDownOptions = this.state.dropDownOptions
        var newMenusToDisplay = this.state.menusToDisplay
        for (var i = 0; i < newMenusToDisplay.length; i++) {
            if (newMenusToDisplay[i] === menu) {
                newMenusToDisplay.splice(i, 1)
            }
            if (menu === "listOfUsers") {
                var newOption = {
                    text: "Team member",
                    value: "listOfUsers"
                }
                newDropDownOptions.unshift(newOption)
            } else if (menu === "listOfActions") {
                var newOption = {
                    text: "Action",
                    value: "listOfActions"
                }
                newDropDownOptions.splice(1, 0, newOption)
            } else if (menu === "listOfParkings") {
                var newOption = {
                    text: "Parkings",
                    value: "listOfParkings"
                }
                newDropDownOptions.splice(2, 0, newOption)
            } else if (menu === "dates") {
                var newOption = {
                    text: "Date",
                    value: "dates"
                }
                newDropDownOptions.push(newOption)
            }
        }
        this.setState({ dropDownOptions: newDropDownOptions, menusToDisplay: newMenusToDisplay })
    }
    handleDateChange(e) {
        var newFilters = this.state.filters
        var newStartingDate = this.state.startingDate
        var newEndDate = this.state.endDate
        if (newFilters.length > 0) {
            for (var i = 0; i < newFilters.length; i++) {
                if (newFilters[i].text === "Date") {
                    if (e.target.name === "starting-date") {
                        newFilters[i].startingDate = e.target.value
                        newStartingDate = e.target.value
                        break
                    } else if (e.target.name === "end-date") {
                        newFilters[i].endDate = e.target.value
                        newEndDate = e.target.value
                        break
                    }
                } else {
                    if (e.target.name === "starting-date") {
                        var newFilterObj = {
                            text: "Date",
                            startingDate: e.target.value
                        }
                        newStartingDate = e.target.value
                        newFilters.unshift(newFilterObj)
                        break
                    } else if (e.target.name === "end-date") {
                        var newFilterObj = {
                            text: "Date",
                            endDate: e.target.value
                        }
                        newEndDate = e.target.value
                        newFilters.unshift(newFilterObj)
                        break
                    }
                }
            }
        } else {
            if (e.target.name === "starting-date") {
                var newFilterObj = {
                    text: "Date",
                    startingDate: e.target.value
                }
                newStartingDate = e.target.value
                newFilters.unshift(newFilterObj)
            } else if (e.target.name === "end-date") {
                var newFilterObj = {
                    text: "Date",
                    endDate: e.target.value
                }
                newEndDate = e.target.value
                newFilters.unshift(newFilterObj)
            }
        }
        this.setState({
            filters: newFilters,
            startingDate: newStartingDate,
            endDate: newEndDate,
            error: false
        })
    }
    deleteEndDate(item) {
        var newFilters = this.state.filters
        for (var i = 0; i < newFilters.length; i++) {
            if (newFilters[i].text === "Date") {
                newFilters[i].endDate = null
                if (!newFilters[i].endDate && !newFilters[i].startingDate) {
                    newFilters.splice(i, 1)
                }
                break
            }
        }
        this.setState({ filters: newFilters })
    }
    deleteStartingDate(item) {
        var newFilters = this.state.filters
        for (var i = 0; i < newFilters.length; i++) {
            if (newFilters[i].text === "Date") {
                newFilters[i].startingDate = null
                if (!newFilters[i].endDate && !newFilters[i].startingDate) {
                    newFilters.splice(i, 1)
                }
                break
            }
        }
        this.setState({ filters: newFilters })
    }
    async handleSubmit() {
        // var appliedFilters = {
        //     actions: this.state.filters
        // }
        var filteredData
        if (this.state.filters && this.state.filters.length > 0) {
            filteredData = await axios.post("/filters.json", this.state.filters)
        } else {
            this.setState({ error: true })
        }
        if (filteredData && filteredData.data.success) {
            this.props.dispatch(setData(filteredData.data.filteredData, filteredData.data.filters, this.state.startingDate, this.state.endDate))
            this.setState({ filteredData: filteredData.data.filteredData })
        }
    }
    render() {
        const LoadingScreen = styled.div`
            top: 35%;
            position: fixed;
            left: 0;
            right: 0;
            width: 100vw;
            text-align: center;
        `
        const LoadingGif = styled.img`
            width: 100px;
            object-fit: cover;
            object-position: center;
        `
        const Main = styled.div`
            position: relative;
            background-color: rgba(251, 251, 251, 1);
            padding: 8px;
            padding-top: 20px;
            display: flex;
            flex-direction: column;
        `
        const EverythingButButton = styled.div`
            position: relative;
            height: 100%;
            overflow: scroll;
        `
        const FilterBy = styled.div`
        `
        const UsersOptionsBox = styled.div`
            background-color: #f7f7f7;
            border-radius: 4px;
            width: 100%;
            margin: 0px 0 15px 0;
        `
        const UserNameBox = styled.div`
            cursor: pointer;
            padding: 0 8px 0 8px;
            border-bottom: lightgrey solid 1px;

            &:hover{
                background-color: #3F88C5;
                color: white;
                border-radius: 4px;
            }
        `
        const TopButtonWrapper = styled.div`
            padding-bottom: 15px;
            border-bottom: lightgrey 1px solid;
            margin-bottom: 15px;
        `
        const TopSubmitButton = styled.button`
            background-color: #3F88C5;
            cursor: pointer;
            border-radius: 4px;
            width: 100%;
            height: 29px;
            font-size: 14px;
            color: white;

            &:hover{
                transform: scale(1.05)
            }
        `
        const BottomButtonWrapper = styled.div`
            margin-top: 15px;
            padding-top: 15px;
            border-top:  lightgrey 1px solid;
            margin-bottom: 50px;
        `
        const SubmitButton = styled.button`
            background-color: #3F88C5;
            cursor: pointer;
            border-radius: 4px;
            width: 100%;
            height: 29px;
            font-size: 14px;
            color: white;

            &:hover{
                transform: scale(1.05)
            }
        `
        const FilterBox = styled.div`
            margin-bottom: 10px;
        `
        const FilterElementBox = styled.div`
            display: flex;
            justify-content: space-between;
            margin: 8px 0 8px 0;
        `
        const FilterName = styled.div`
            color: #3F88C5;
            padding: 0 8px 0 8px;
        `
        const DeleteFilter = styled.button`
            font-weight: 400;
            color: white;
            background-color: #3F88C5;
            width: 12px;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            border: none;
            text-align: center;
            display: flex;
            justify-content: center;

            &:hover{
                transform: scale(1.1);
            }
        `
        const ParkingOptionsBox = styled.div`
            background-color: #f7f7f7;
            border-radius: 4px;
            width: 100%;
            margin: 8px 0 8px 0;
        `
        const ParkingOptionsScrollableArea = styled.div`
            overflow: scroll;
            max-height: 300px;
        `
        const CloseMenu = styled.div`
            background-color: #3F88C5;
            width: 100%
            height: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 4px 4px 0 0;
            color: white;
            padding: 0 8px 0 8px;
            cursor: pointer;
        `
        const CloseMenuX = styled.div`
            color: white;
            font-size: 18px;
        `
        const CloseMenuText = styled.div`
            color: white;
            font-size: 14px;
        `
        const DateText = styled.div`
            margin-top: 5px;
            color: #3F88C5;
        `
        const DateDiv = styled.div`
            display: flex;
            justify-content: space-between;
            color: #3F88C5;
            padding: 4px 0 4px 8px;
        `
        const FiltersWrapper = styled.div`
            padding-bottom: 15px;
            border-bottom: lightgrey 1px solid;
            margin-bottom: 15px;
        `
        const Title = styled.div`
            width: 100%;
            color: #3F88C5;
            text-align: center;
            font-size: 18px;
            font=weight: 400;
            margin-bottom: 10px;
        `
        const ErrorMessage = styled.div`
            color: #FF6384;
            font-size: 16px;
            font-weigth: 400;
            width: 100%;
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: lightgrey 1px solid;
        `
        if (!this.state.listOfUsers || !this.state.listOfParkings) {
            return (
                <LoadingScreen>
                    <h3>Loading workspace</h3>
                    <LoadingGif src="/content/loading.gif" alt=""/>
                </LoadingScreen>
            )
        }
        return (
            <Main className="shadow">
                <EverythingButButton>
                    <TopButtonWrapper>
                        <TopSubmitButton
                            className="shadow"
                            onClick={this.handleSubmit}
                        >Submit</TopSubmitButton>
                    </TopButtonWrapper>
                    { (this.state.error && this.state.filters.length <= 0) &&
                        <ErrorMessage>Please select filters<br/>before submitting</ErrorMessage>
                    }
                    { (this.state.filters.length > 0) && <FiltersWrapper>
                        <Title>Current Filters</Title>
                        { this.state.filters.map(obj => {
                            if (obj.text === "Date") {
                                return (
                                    <FilterBox key={obj.text}>
                                    { (obj.startingDate && obj.endDate) ?
                                        <div>
                                            <div>Filtering dates from:</div>
                                            <DateDiv>{obj.startingDate}
                                                <DeleteFilter
                                                    onClick={() => this.deleteStartingDate(obj)}
                                                >x</DeleteFilter>
                                            </DateDiv>
                                            <div>to:</div>
                                            <DateDiv>{obj.endDate}
                                                <DeleteFilter
                                                    onClick={() => this.deleteEndDate(obj)}
                                                >x</DeleteFilter>
                                            </DateDiv>
                                        </div> :
                                        <div>
                                        { (!obj.startingDate && obj.endDate) &&
                                            <div>
                                                <div>Filtering dates until:</div>
                                                <DateDiv>{obj.endDate}
                                                <DeleteFilter
                                                    onClick={() => this.deleteEndDate(obj)}
                                                >x</DeleteFilter>
                                                </DateDiv>
                                            </div>
                                        }
                                        { (obj.startingDate && !obj.endDate) &&
                                            <div>
                                                <div>Filtering dates starting from:</div>
                                                <DateDiv>{obj.startingDate}
                                                <DeleteFilter
                                                    onClick={() => this.deleteStartingDate(obj)}
                                                >x</DeleteFilter>
                                                </DateDiv>
                                            </div>
                                        }
                                        </div>
                                    }
                                    </FilterBox>
                                )
                            } else {
                                return (
                                    <FilterBox key={obj.text}>
                                    <div>{ obj.text }</div>
                                    { obj.list.map(item => {
                                        return (
                                            <FilterElementBox key={ item }>
                                                <FilterName>{ item }</FilterName>
                                                <DeleteFilter
                                                    onClick={() => this.deleteFilter(obj, item)}
                                                >x</DeleteFilter>
                                            </FilterElementBox>
                                        )
                                    })
                                }
                                </FilterBox>
                            )}})}
                    </FiltersWrapper>
                    }
                    <div className="styled-select blue semi-square">
                        <select name="filter_by" onChange={ this.handleSelectChange }>
                            <option>{
                                ((this.state.menusToDisplay.length <= 0) && (this.state.filters.length <= 0)) ?
                                "Filter by ..." :
                                "Select more filters ..."
                            }</option>
                            { this.state.dropDownOptions.map(item => {
                                return (
                                    <option key={ item.value } value={ item.value }>{  item.text }</option>
                                )
                            })}
                        </select>
                    </div>
                    { ((this.state.menusToDisplay.length > 0) || (this.state.filters.length > 0)) &&
                        <div>
                            { this.state.menusToDisplay.map(menu => {
                                if (menu === "listOfUsers") {
                                    return (
                                        <UsersOptionsBox className="shadow" key={menu}>
                                            <CloseMenu onClick={() => this.closeMenu(menu)}
                                            ><CloseMenuText>Team Member/s</CloseMenuText><CloseMenuX>x</CloseMenuX></CloseMenu>
                                            { this.state.listOfUsers && this.state.listOfUsers.map(user => {
                                                return (
                                                    <UserNameBox key={user}
                                                        onClick={() => this.setFilter("Team member/s", user)}
                                                    >{user}</UserNameBox>
                                                )
                                            })}
                                        </UsersOptionsBox>
                                    )
                                } else if (menu === "listOfActions") {
                                    return (
                                        <UsersOptionsBox className="shadow" key={menu}>
                                            <CloseMenu onClick={() => this.closeMenu(menu)}
                                            ><CloseMenuText>Action/s</CloseMenuText><CloseMenuX>x</CloseMenuX></CloseMenu>
                                            { this.state.listOfActions && this.state.listOfActions.map(action => {
                                                return (
                                                    <UserNameBox key={action}
                                                        onClick={() => this.setFilter("Action/s", action)}
                                                    >{action}</UserNameBox>
                                                )
                                            })}
                                        </UsersOptionsBox>
                                    )
                                } else if (menu === "listOfParkings") {
                                    return (
                                        <ParkingOptionsBox className="shadow" key={menu}>
                                            <CloseMenu onClick={() => this.closeMenu(menu)}
                                            ><CloseMenuText>Parking IDs</CloseMenuText><CloseMenuX>x</CloseMenuX></CloseMenu>
                                            <ParkingOptionsScrollableArea>
                                                { this.state.listOfParkings && this.state.listOfParkings.map(parkingId => {
                                                    return (
                                                        <UserNameBox key={parkingId}
                                                        onClick={() => this.setFilter("Parking/s", parkingId)}
                                                        >{parkingId}</UserNameBox>
                                                    )
                                                })}
                                            </ParkingOptionsScrollableArea>
                                        </ParkingOptionsBox>
                                    )
                                } else if (menu === "dates") {
                                    return (
                                        <ParkingOptionsBox className="shadow" key={menu}>
                                            <CloseMenu onClick={() => this.closeMenu(menu)}
                                            ><CloseMenuText>Dates</CloseMenuText><CloseMenuX>x</CloseMenuX></CloseMenu>
                                            <DateText>Starting Date</DateText>
                                            <form>
                                                <input
                                                    id="calendar-input"
                                                    type="date"
                                                    name="starting-date"
                                                    onChange={this.handleDateChange}
                                                    defaultValue={this.state.startingDate}
                                                    max={this.state.endDate}
                                                />
                                            </form>
                                            <DateText>End Date</DateText>
                                            <form>
                                                <input
                                                    id="calendar-input"
                                                    type="date"
                                                    name="end-date"
                                                    onChange={this.handleDateChange}
                                                    defaultValue={this.state.endDate}
                                                    min={this.state.startingDate}
                                                />
                                            </form>
                                        </ParkingOptionsBox>
                                    )
                                }
                            })}
                        </div>
                    }
                </EverythingButButton>
                <BottomButtonWrapper>
                    <SubmitButton
                        className="shadow"
                        onClick={this.handleSubmit}
                    >Submit</SubmitButton>
                </BottomButtonWrapper>
            </Main>
        );
    }
}

export default connect(mapStateToProps)(LeftMenu);
