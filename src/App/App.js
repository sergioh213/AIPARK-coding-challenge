import React, { Component } from 'react';
import axios from '../axios'
import LeftMenu from '../LeftMenu/LeftMenu'
import ContentField from '../ContentField/ContentField'
import {Doughnut} from 'react-chartjs-2';
import styled from 'styled-components'

class App extends Component {
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
            filters: []
        }
    }
    componentDidMount(){
        axios.get("/data.json").then(async ({data}) => {
            await this.setState({
                listOfUsers: data.listOfUsers,
                listOfParkings: data.listOfParkings,
                doughnut1: {
                	labels: [
                		'Red',
                		'Blue',
                		'Yellow'
                	],
                	datasets: [{
                		data: [300, 50, 100],
                		backgroundColor: [
                		'#FF6384',
                		'#36A2EB',
                		'#FFCE56'
                		],
                		hoverBackgroundColor: [
                		'#FF6384',
                		'#36A2EB',
                		'#FFCE56'
                		]
                	}]
                }
            })
        })
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
            position: relative
            display: flex;
            height: 100vh;
            width: 100vw;
            overflow: hidden;
        `
        if (!this.state.doughnut1) {
            return (
                <LoadingScreen>
                    <h3>Loading workspace</h3>
                    <LoadingGif src="/content/loading.gif" alt=""/>
                </LoadingScreen>
            )
        }
        return (
            <Main>
                <LeftMenu />
                <ContentField />
            </Main>
        );
    }
}

export default App;
