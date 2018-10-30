import React, { Component } from 'react';
import axios from '../axios'
import LeftMenu from '../LeftMenu/LeftMenu'
import {Doughnut} from 'react-chartjs-2';
import styled from 'styled-components'
import { connect } from 'react-redux';

const mapStateToProps = state => {
    return {
        filteredData: state.filteredData,
        filters: state.filters,
        startingDate: state.startingDate,
        endDate: state.endDate
    }
}

class ContentField extends Component {
    constructor(props) {
        super(props)

        this.state = {}

        this.generateColor = this.generateColor.bind(this)
        this.completeFilters = this.completeFilters.bind(this)
    }
    componentDidMount() {
        this.setState({ mounted: true })
    }
    componentWillReceiveProps(nextProps) {
        var newSections
        if (nextProps.filteredData && nextProps.filters) {
            if (
                nextProps.filters.parkings &&
                nextProps.filters.actions &&
                nextProps.filters.teamMembers
            ) {
                newSections = this.completeFilters(nextProps)
            } else if (
                nextProps.filters.parkings &&
                nextProps.filters.actions
            ) {
                // newSections = this.parkingsActions(nextProps)
                var onlyParkings = this.parkings(nextProps)
                this.setState({ onlyParkings: onlyParkings })
            } else if (
                nextProps.filters.parkings &&
                nextProps.filters.teamMembers &&
                !nextProps.filters.actions
            ) {
                newSections = this.parkingUsers(nextProps)
            } else if (
                nextProps.filters.actions &&
                nextProps.filters.teamMembers &&
                !nextProps.filters.parkings
            ) {
                var onlyUsers = this.users(nextProps)
                this.setState({ onlyUsers: onlyUsers })
            } else if (
                nextProps.filters.parkings &&
                !nextProps.filters.actions &&
                !nextProps.filters.teamMembers
            ) {
                var onlyParkings = this.parkings(nextProps)
                this.setState({ onlyParkings: onlyParkings })
            } else if (
                nextProps.filters.actions &&
                !nextProps.filters.teamMembers &&
                !nextProps.filters.parkings
            ) {
                var onlyUsers = this.users(nextProps)
                this.setState({ onlyUsers: onlyUsers })
            } else if (
                nextProps.filters.teamMembers &&
                !nextProps.filters.actions &&
                !nextProps.filters.parkings
            ) {
                var onlyUsers = this.users(nextProps)
                this.setState({ onlyUsers: onlyUsers })
            }
            if (newSections) {
                this.setState({ sections: newSections })
            }
        }
    }
    generateColor () {
        return '#' +  Math.random().toString(16).substr(-6);
    }
    completeFilters(data) {
        var sections = []
        for (var i = 0; i < data.filters.parkings.length; i++) {
            var obj = {
                parkingId: data.filters.parkings[i],
                listOfActions: []
            }
            sections.push(obj)
        }
        data.filteredData.forEach(async (item) => {
            await sections.forEach(element => {
                if (element.parkingId === item.parkingarea_id) {
                    element.listOfActions.push(item)
                }
            })
        })
        ////////////////////////////////////////////////////
        for (var i = 0; i < sections.length; i++) {
            var newlistOfActions = []
            sections[i].listOfActions.forEach(async (item, index, array) => {
                if (newlistOfActions.length === 0) {
                    var actionObj = {
                        action: item.action,
                        users: [],
                        doughnut: {}
                    }
                    actionObj.users.push(item.username_alias)
                    newlistOfActions.push(actionObj)
                } else {
                    var toPush = true
                    for (var i = 0; i < newlistOfActions.length; i++) {
                        if (item.action === newlistOfActions[i].action) {
                            newlistOfActions[i].users.push(item.username_alias)
                            toPush = false
                            break
                        }
                    }
                    if (toPush) {
                        var actionObj = {
                            action: item.action,
                            users: [],
                            doughnut: {}
                        }
                        actionObj.users.push(item.username_alias)
                        newlistOfActions.push(actionObj)
                    }
                }
            })
            sections[i].listOfActions = newlistOfActions
            for (var j = 0; j < sections[i].listOfActions.length; j++) {
                var newUsersListForActionObject = []
                if (sections[i].listOfActions[j].users.length === 1) {
                    var newUser = {
                        userId: sections[i].listOfActions[j].users[0],
                        userTimes: 1
                    }
                    newUsersListForActionObject.push(newUser)
                } else if (sections[i].listOfActions[j].users.length > 1){
                    var counter = 0
                    sections[i].listOfActions[j].users.sort()
                    for (var z = 0; z < sections[i].listOfActions[j].users.length; z++) {
                        var newUser = {
                            userId: sections[i].listOfActions[j].users[z],
                            userTimes: 1
                        }
                        if (newUsersListForActionObject.length === 0) {
                            newUsersListForActionObject.push(newUser)
                        } else if(newUsersListForActionObject.length > 0) {
                            var needsPush = true
                            if (newUsersListForActionObject[counter].userId === sections[i].listOfActions[j].users[z]) {
                                needsPush = false
                                newUsersListForActionObject[counter].userTimes ++
                            }
                            if (needsPush) {
                                counter ++
                                newUsersListForActionObject.push(newUser)
                            }
                        }
                    }
                }
                sections[i].listOfActions[j].users = newUsersListForActionObject
                //////////// filling chart ////////////
                var doughnutUsers = []
                var numbersToDisplay = []
                var colors = []
                for (var x = 0; x < sections[i].listOfActions[j].users.length; x++) {
                    doughnutUsers.push("User alias: " + sections[i].listOfActions[j].users[x].userId)
                    numbersToDisplay.push(sections[i].listOfActions[j].users[x].userTimes)
                    colors.push(this.generateColor())
                }
                sections[i].listOfActions[j].doughnut = {
                    labels: doughnutUsers,
                    datasets: [{
                        data: numbersToDisplay,
                        backgroundColor: colors,
                        hoverBackgroundColor: colors
                    }]
                }
            }
        }
        return sections
    }
    parkingsActions(data) {
        var sections = []
        for (var i = 0; i < data.filters.parkings.length; i++) {
            var obj = {
                parkingId: data.filters.parkings[i],
                listOfActions: []
            }
            sections.push(obj)
        }
        data.filteredData.forEach(async (item) => {
            await sections.forEach(element => {
                if (element.parkingId === item.parkingarea_id) {
                    element.listOfActions.push(item)
                }
            })
        })
        return sections
    }
    parkingUsers(data) {
        var sections = []
        for (var i = 0; i < data.filters.parkings.length; i++) {
            var obj = {
                parkingId: data.filters.parkings[i],
                listOfUsers: [],
                doughnut: {}
            }
            sections.push(obj)
        }
        data.filteredData.forEach(async (item) => {
            await sections.forEach(element => {
                if (element.parkingId === item.parkingarea_id) {
                    element.listOfUsers.push(item)
                }
            })
        })
        sections.forEach(element => {
            var newListOfUsers = []
            if (element.listOfUsers.length === 1) {
                var userObj = {
                    userId: element.listOfUsers[0].username_alias,
                    userTimes: 1,
                    actionList: []
                }
                userObj.actionList.push(element.listOfUsers[0])
                newListOfUsers.push(userObj)
            } else if (element.listOfUsers.length > 1) {
                element.listOfUsers.sort((a, b) => {
                    return ('' + a.username_alias).localeCompare(b.username_alias);
                })
                for (var i = 0; i < element.listOfUsers.length; i++) {
                    if (i === 0) {
                        var userObj = {
                            userId: element.listOfUsers[i].username_alias,
                            userTimes: 1,
                            actionList: []
                        }
                        userObj.actionList.push(element.listOfUsers[i])
                        newListOfUsers.push(userObj)
                    } else {
                        var counter = 0
                        var toPush = true
                        if (newListOfUsers[counter].userId === element.listOfUsers[i].username_alias) {
                            newListOfUsers[counter].userTimes++
                            newListOfUsers[counter].actionList.push(element.listOfUsers[i])
                            counter++
                            toPush = false
                        }
                        if (toPush) {
                            var userObj = {
                                userId: element.listOfUsers[i].username_alias,
                                userTimes: 1,
                                actionList: []
                            }
                            userObj.actionList.push(element.listOfUsers[i])
                            newListOfUsers.push(userObj)
                        }
                    }
                }
            }
            element.listOfUsers = newListOfUsers
            var doughnutUsers = []
            var numbersToDisplay = []
            var colors = []
            for (var i = 0; i < element.listOfUsers.length; i++) {
                numbersToDisplay.push(element.listOfUsers[i].userTimes)
                doughnutUsers.push("User Alias: " + element.listOfUsers[i].userId)
                colors.push(this.generateColor())
            }
            element.doughnut = {
                labels: doughnutUsers,
                datasets: [{
                    data: numbersToDisplay,
                    backgroundColor: colors,
                    hoverBackgroundColor: colors
                }]
            }
        })
        return sections
    }
    parkings(data) {
        var sections = []
        var newParkings = []
        data.filteredData.forEach(element => {
            var newActionObj = {
                parkingId: element.parkingarea_id,
                obj: element
            }
            newParkings.push(newActionObj)
        })
        newParkings.sort((a, b) => {
            return ('' + a.parkingId).localeCompare(b.parkingId)
        })
        var myList = []
        var counter = 0
        newParkings.forEach(element => {
            var parkingObj = {
                parkingId: element.parkingId,
                listOfActions: []
            }
            if (myList.length === 0) {
                parkingObj.listOfActions.push(element.obj)
                myList.push(parkingObj)
            } else {
                var toPush = true
                if (myList[counter].parkingId === element.parkingId) {
                    myList[counter].listOfActions.push(element.obj)
                    toPush = false
                }
                if (toPush) {
                    parkingObj.listOfActions.push(element.obj)
                    myList.push(parkingObj)
                    counter++
                }
            }
        })
        /////// adding unique ID to objects in listOfActions ////////
        myList.forEach(element => {
            for (var i = 0; i < element.listOfActions.length; i++) {
                element.listOfActions[i].id = i
            }
        })
        return myList
    }
    actions(data) {
        var sections = []
        var newActions = []
        data.filteredData.forEach(element => {
            var newActionObj = {
                action: element.action,
                obj: element
            }
            newActions.push(newActionObj)
        })
        newActions.sort((a, b) => {
            return ('' + a.action).localeCompare(b.action)
        })
        var counter = 0
        for (var i = 0; i < newActions.length; i++) {
            var newObj = {
                action: newActions[i].action,
                list: []
            }
            if (sections.length === 0) {
                newObj.list.push(newActions[i])
                sections.push(newObj)
            } else {
                var toPush = true
                if (sections[counter].action === newActions[i].action) {
                    sections[counter].list.push(newActions[i])
                    toPush = false
                }
                if (toPush) {
                    newObj.list.push(newActions[i])
                    sections.push(newObj)
                    counter ++
                }
            }
        }
        sections.forEach(element => {
            element.groupedUsers = []
            var counter = 0
            element.list.sort((a, b) => {
                return ('' + (a.username_alias || a.obj.username_alias)).localeCompare((b.username_alias || b.obj.username_alias))
            })
            for (var i = 0; i < element.list.length; i++) {
                var actionObj = {
                    userId: "",
                    userTimes: 1
                }
                if (element.list[i].username_alias) {
                    actionObj.userId = element.list[i].username_alias
                } else if (element.list[i].obj) {
                    actionObj.userId = element.list[i].obj.username_alias
                }
                if (element.groupedUsers.length === 0) {
                    element.groupedUsers.push(actionObj)
                } else {
                    var toPush = true
                    if (element.groupedUsers[counter].userId === (element.list[i].username_alias || element.list[i].obj.username_alias)) {
                        element.groupedUsers[counter].userTimes++
                        toPush = false
                    }
                    if (toPush) {
                        element.groupedUsers.push(actionObj)
                        counter++
                    }
                }
            }
            var doughnutActions = []
            var numbersOfActionsToDisplay = []
            var randomColors = []
            for (var i = 0; i < element.groupedUsers.length; i++) {
                numbersOfActionsToDisplay.push(element.groupedUsers[i].userTimes)
                doughnutActions.push("User alias: " + element.groupedUsers[i].userId)
                randomColors.push(this.generateColor())
            }
            element.doughnut = {
                labels: doughnutActions,
                datasets: [{
                    data: numbersOfActionsToDisplay,
                    backgroundColor: randomColors,
                    hoverBackgroundColor: randomColors
                }]
            }
        })
        var doughnutUsers = []
        var numbersToDisplay = []
        var colors = []
        for (var i = 0; i < sections.length; i++) {
            numbersToDisplay.push(sections[i].list.length)
            doughnutUsers.push(sections[i].action)
            colors.push(this.generateColor())
        }
        var returnObj = {
            actionList: sections,
            doughnut: {
                labels: doughnutUsers,
                datasets: [{
                    data: numbersToDisplay,
                    backgroundColor: colors,
                    hoverBackgroundColor: colors
                }]
            }
        }
        return returnObj
    }
    users(data) {
        var sections = []
        var newUsers = []
        data.filteredData.forEach(element => {
            var newActionObj = {
                userId: element.username_alias,
                obj: element
            }
            newUsers.push(newActionObj)
        })
        newUsers.sort((a, b) => {
            return ('' + a.userId).localeCompare(b.userId)
        })
        var counter = 0
        for (var i = 0; i < newUsers.length; i++) {
            var newObj = {
                userId: newUsers[i].userId,
                list: []
            }
            if (sections.length === 0) {
                newObj.list.push(newUsers[i].obj)
                sections.push(newObj)
            } else {
                var toPush = true
                if (sections[counter].userId === newUsers[i].userId) {
                    sections[counter].list.push(newUsers[i])
                    toPush = false
                }
                if (toPush) {
                    newObj.list.push(newUsers[i])
                    sections.push(newObj)
                    counter ++
                }
            }
        }
        sections.forEach(element => {
            element.groupedActions = []
            var counter = 0
            element.list.sort((a, b) => {
                return ('' + (a.action || a.obj.action)).localeCompare((b.action || b.obj.action))
            })
            for (var i = 0; i < element.list.length; i++) {
                var actionObj = {
                    action: "",
                    actionTimes: 1
                }
                if (element.list[i].action) {
                    actionObj.action = element.list[i].action
                } else if (element.list[i].obj) {
                    actionObj.action = element.list[i].obj.action
                }
                if (element.groupedActions.length === 0) {
                    element.groupedActions.push(actionObj)
                } else {
                    var toPush = true
                    if (element.groupedActions[counter].action === (element.list[i].action || element.list[i].obj.action)) {
                        element.groupedActions[counter].actionTimes++
                        toPush = false
                    }
                    if (toPush) {
                        element.groupedActions.push(actionObj)
                        counter++
                    }
                }
            }
            var doughnutActions = []
            var numbersOfActionsToDisplay = []
            var randomColors = []
            for (var i = 0; i < element.groupedActions.length; i++) {
                numbersOfActionsToDisplay.push(element.groupedActions[i].actionTimes)
                doughnutActions.push(element.groupedActions[i].action)
                randomColors.push(this.generateColor())
            }
            element.doughnut = {
                labels: doughnutActions,
                datasets: [{
                    data: numbersOfActionsToDisplay,
                    backgroundColor: randomColors,
                    hoverBackgroundColor: randomColors
                }]
            }
        })
        var doughnutUsers = []
        var numbersToDisplay = []
        var colors = []
        for (var i = 0; i < sections.length; i++) {
            numbersToDisplay.push(sections[i].list.length)
            doughnutUsers.push(sections[i].userId)
            colors.push(this.generateColor())
        }
        var onlyActions = this.actions(data)
        var returnObj = {
            userList: sections,
            actionList: onlyActions.actionList,
            actionDoughnut: onlyActions.doughnut,
            userDoughnut: {
                labels: doughnutUsers,
                datasets: [{
                    data: numbersToDisplay,
                    backgroundColor: colors,
                    hoverBackgroundColor: colors
                }]
            }
        }
        return returnObj
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
            width: 100%;
            ${() => {
                if (!this.props.filteredData) {
                    return `
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    `
                }
            }}
            overflow: scroll;
            padding: 10px 20px 20px 20px;
        `
        const DefaultMessage = styled.div`
            position: relative;
        `
        const SummaryBox = styled.div`
            background-color: rgba(251, 251, 251, 1);
            margin-bottom: 20px;
            padding: 10px 10px 10px 10px;
            display: flex;
            justify-content: space-between;
        `
        const DataMatches = styled.div`
            font-size: 20px;
        `
        const DataMatchesNum = styled.div`
            font-size: 22px;
            font-weigth: 400px;
            color: #3F88C5;
        `
        const RightSideText = styled.div`
            position: relative;
            display: flex;
        `
        const LeftSideText = styled.div`
            position: relative;
        `
        const DateDiv = styled.div`
            font-size: 20px;
            color: #3F88C5;
            margin-right: 10px;
        `
        const DateValue = styled.div`
            color: #3F88C5;
            font-size: 14px;
        `
        const DateText = styled.div`
            font-size: 12px;
        `
        const DateContentDiv = styled.div`
            display: flex;
            flex-direction: column;
        `
        const Section = styled.section`
            display: flex;
            overflow: scroll;
            flex-direction: column;
            padding: 20px 20px 20px 20px;
        `
        const DoughnutRow = styled.div`
            display: flex;
            overflow: scroll;
        `
        const ParkingId = styled.div`
            display: inline-block;
            color: #3F88C5;
            font-weigth: 400;
            font-size: 24px;
            margin-left: 20px;
        `
        const ParkingIdText = styled.div`
            display: inline-block;
            margin-left: 10px;
        `
        const ChartWrapper = styled.div`
            display: flex;
            flex-direction: column;
            margin: 0 0 0 40px;
            align-items: center;
        `
        const ActionText = styled.div`
            margin-top: 15px;
        `
        const SingleAction = styled.div`
            margin-top: 15px;
            color: #3F88C5;
        `
        const ChartTitle = styled.div`
            text-align: center;
            font-size: 14px;
            font-weight: 400;
        `
        const TableWrapper = styled.div`
            width: 100%;
            margin-top: 20px;
            margin-bottom: 20px;
        `
        const TableHeader = styled.div`
            width: 100%;
            background-color:  #3F88C5;
            color: white;
            padding: 5px;
        `
        const Table = styled.div`
            display: grid;
            grid-template-rows: repeat(auto, 1fr);
        `
        const TableTopRow = styled.div`
            display: grid;
            background-color:  #71bbf7;
            color: white;
            grid-template-columns: 54px 1fr 2fr 1fr;
        `
        const TableTopRowParking = styled.div`
            display: grid;
            background-color:  #71bbf7;
            color: white;
            grid-template-columns: 54px 1fr 1fr 2fr 1fr;
        `
        const TableRow = styled.div`
            display: grid;
            background-color: white;
            grid-template-columns: 54px 1fr 2fr 1fr;
        `
        const TableRowParking = styled.div`
            display: grid;
            background-color: white;
            grid-template-columns: 54px 1fr 1fr 2fr 1fr;
        `
        const TableCell = styled.div`
            padding: 5px;
            border: 1px solid #3F88C5;
        `
        const DoughnutRowUsers = styled.div`
            display: flex;
            overflow: scroll;
        `
        const ChartWrapperBigger = styled.div`
            display: flex;
            flex-direction: column;
            margin: 0 0 0 50px;
            align-items: center;
            min-width: 400px;
            min-height: 300px;
        `
        if (!this.state.mounted) {
            return (
                <LoadingScreen>
                    <h3>Loading content</h3>
                    <LoadingGif src="/content/loading.gif" alt=""/>
                </LoadingScreen>
            )
        }
        return (
            <Main>
                { !this.props.filteredData ?
                    <DefaultMessage>Content will be displayed here</DefaultMessage> :
                    <div>
                        { this.props.filteredData &&
                            <div>
                                { (this.props.filteredData.length > 0) ?
                                    <SummaryBox className="shadow">
                                        <LeftSideText>
                                            <DataMatches>Data matches:</DataMatches>
                                            <DataMatchesNum>{this.props.filteredData.length}</DataMatchesNum>
                                        </LeftSideText>
                                        { ((this.props.startingDate || this.props.endDate) && this.props.filters.dates) &&
                                            <RightSideText>
                                                <DateDiv>Date:</DateDiv>
                                                <DateContentDiv>
                                                    { this.props.startingDate &&
                                                        <div>
                                                            <DateText>From:</DateText>
                                                            <DateValue>{this.props.startingDate}</DateValue>
                                                        </div>
                                                    }
                                                    { this.props.endDate &&
                                                        <div>
                                                            <DateText>To:</DateText>
                                                            <DateValue>{this.props.endDate}</DateValue>
                                                        </div>
                                                    }
                                                </DateContentDiv>
                                            </RightSideText>
                                        }
                                    </SummaryBox> :
                                    <SummaryBox className="shadow">
                                        <div>No matches following your convination of filters</div>
                                        <div>Please try again with different filters</div>
                                    </SummaryBox>
                                }
                            </div>
                        }
                        <div className="shadow">
                            { this.state.sections && this.state.sections.map(item => {
                                return (
                                    <Section key={item.parkingId} >
                                        { this.props.filters.parkings && <div><ParkingIdText>Parking area ID: </ParkingIdText><ParkingId>{item.parkingId}</ParkingId></div> }
                                        { (item.listOfUsers && item.listOfUsers.length > 1) &&
                                            <div>
                                                <ChartTitle>Num of actions by user</ChartTitle>
                                                <Doughnut data={item.doughnut} />
                                            </div>
                                        }
                                        <DoughnutRow>
                                            { item.listOfActions && item.listOfActions.map(elem => {
                                                if (elem.doughnut) {
                                                    return (
                                                        <ChartWrapper key={elem.action}>
                                                            <Doughnut data={elem.doughnut} />
                                                            <ActionText>{elem.action}</ActionText>
                                                        </ChartWrapper>
                                                    )
                                                }
                                            })}
                                        </DoughnutRow>
                                        { item.listOfUsers && item.listOfUsers.map(elem => {
                                            return (
                                                <TableWrapper key={elem.userId} id="chart_wrapper">
                                                    <TableHeader>User Alias: {elem.userId}</TableHeader>
                                                    <Table>
                                                        <TableTopRow>
                                                            <TableCell>Index</TableCell>
                                                            <TableCell>Action</TableCell>
                                                            <TableCell>Date</TableCell>
                                                            <TableCell>Unix time</TableCell>
                                                        </TableTopRow>
                                                        { elem.actionList.map((actionInfo, index) => {
                                                            return (
                                                                <TableRow key={actionInfo.action}>
                                                                    <TableCell>{`#${index}`}</TableCell>
                                                                    <TableCell>{actionInfo.action}</TableCell>
                                                                    <TableCell>{actionInfo.date_in_central_european_time}</TableCell>
                                                                    <TableCell>{actionInfo.unix_timestamp}</TableCell>
                                                                </TableRow>
                                                            )
                                                        })}
                                                    </Table>
                                                </TableWrapper>
                                            )
                                        })}
                                    </Section>
                                )})}
                                { (this.state.onlyUsers && (this.props.filteredData.length > 0)) &&
                                    <div>
                                        <Section>
                                            <ChartTitle>Users number of actions</ChartTitle>
                                            <Doughnut data={this.state.onlyUsers.userDoughnut}/>
                                        </Section>
                                        <Section>
                                            <ChartTitle>Number of times each action has been made</ChartTitle>
                                            <Doughnut data={this.state.onlyUsers.actionDoughnut}/>
                                        </Section>
                                        <Section>
                                            <ParkingIdText>Actions used by each user:</ParkingIdText>
                                            <DoughnutRowUsers>
                                            { this.state.onlyUsers.userList.map(item => {
                                                return (
                                                    <ChartWrapperBigger key={item.userId}>
                                                        <ChartTitle>{item.userId}</ChartTitle>
                                                        <Doughnut
                                                            data={item.doughnut}
                                                            width={200}
                                                            height={200}
                                                            options={{
                                                                maintainAspectRatio: true
                                                            }}
                                                        />
                                                    </ChartWrapperBigger>
                                                )
                                            })}
                                            </DoughnutRowUsers>
                                        </Section>
                                        <Section>
                                            <ParkingIdText>Times an action has been used by a user:</ParkingIdText>
                                            <DoughnutRowUsers>
                                            { this.state.onlyUsers.actionList.map(item => {
                                                return (
                                                    <ChartWrapperBigger key={item.action}>
                                                        <ChartTitle>{item.action}</ChartTitle>
                                                        <Doughnut
                                                            data={item.doughnut}
                                                            width={200}
                                                            height={200}
                                                            options={{
                                                                maintainAspectRatio: true
                                                            }}
                                                        />
                                                    </ChartWrapperBigger>
                                                )
                                            })}
                                            </DoughnutRowUsers>
                                        </Section>
                                    </div>
                                }
                                { this.state.onlyParkings &&
                                    <div>
                                            { this.state.onlyParkings.map(item => {
                                                return (
                                                    <Section key={item.parkingId}>
                                                        <div><ParkingIdText>Parking area ID: </ParkingIdText><ParkingId>{item.parkingId}</ParkingId></div>
                                                        <Table>
                                                            <TableTopRowParking>
                                                                <TableCell>Index</TableCell>
                                                                <TableCell>User Alias</TableCell>
                                                                <TableCell>Action</TableCell>
                                                                <TableCell>Date</TableCell>
                                                                <TableCell>Unix time</TableCell>
                                                            </TableTopRowParking>
                                                            { item.listOfActions.map(elem => {
                                                                return (
                                                                    <TableRowParking key={elem.id}>
                                                                        <TableCell>{elem.id+1}</TableCell>
                                                                        <TableCell>{elem.username_alias}</TableCell>
                                                                        <TableCell>{elem.action}</TableCell>
                                                                        <TableCell>{elem.date_in_central_european_time}</TableCell>
                                                                        <TableCell>{elem.unix_timestamp}</TableCell>
                                                                    </TableRowParking>
                                                                )
                                                            })}
                                                        </Table>
                                                    </Section>
                                                )
                                            })}
                                    </div>
                                }
                        </div>
                    </div>
                }
            </Main>
        );
    }
}

export default connect(mapStateToProps)(ContentField);
