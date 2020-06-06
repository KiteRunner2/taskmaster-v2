import React, { useState, useEffect } from "react";
import "../../components-style.css";
import PropTypes from "prop-types";
import Card from "../Card/Card";
import Draggable from "../Draggable/Draggable";
import styled from "styled-components";
import ColumnTitle from "../ColumTitle/ColumnTitle";
import { v4 as uuidv4 } from "uuid";
import { connect } from "react-redux";
import * as action from "../../utils/actions";
import { Button } from "@material-ui/core";


function Column(props) {

  const { dispatch, userprofile, colIndex, cards } = props;
  const [show, setShow] = useState(false);
  function showModal() {
    console.log("showModal function called...");
    setShow(true);
  }

  function hideModal() {
    console.log("hideModal function called...");
    setShow(false);
  }

  function drop(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData("transfer");
    let toDrop = document.getElementById(data);
    e.target.appendChild(toDrop);
    let droppedCard = document.getElementById(data);
    let cardTitle = document.getElementById("title" + data);
    let cardDescription = document.getElementById("desc" + data);
    let cardDate = document.getElementById("date" + data);
    let element = document.getElementById(data);
    element.parentNode.removeChild(element);
    let dataToPass = {
      toAdd: {
        colIndex: props.colIndex,
        title: cardTitle.value,
        description: cardDescription.value,
        duedate: cardDate.value,
      },
      toRemove: {
        colIndex: droppedCard.dataset.colindex,
        cardIndex: droppedCard.dataset.cardindex,
      },
    };
    props.updateCardsOnDrop(dataToPass);
  }

  function allowDrop(e) {
    e.preventDefault();
  }

  function dragEnd() {
    // console.log('drag ended');
  }

  function deleteColumnFromDashboard(){
    dispatch(action.deleteColumn({ colIndex: props.colIndex }));
    dispatch(action.updateUserProfile(userprofile));
  }

  function addCardToColumn(){
    dispatch(action.addCard({ colIndex }));
    dispatch(action.updateUserProfile(userprofile))
  }

  return (
    <div
      className="project-column"
      id={props.id}
      onDrop={drop}
      onDragOver={allowDrop}
      // style={props.style}
      onDragEnd={dragEnd}
      key={uuidv4()}
    >
      <div className="column-header">
        <Button
          variant="contained"
          color="default"
          onClick={() => deleteColumnFromDashboard()}
          style={{ float: "right" }}
        >
          <i class="far fa-trash-alt"></i>
        </Button>
      </div>
      <ColumnTitle title={props.colTitle} updateColumnTitle={props.updateColumnTitle} index={colIndex}/>
      <Button
        color="default"
        variant="contained"
        size="small"
        onClick={() => addCardToColumn()}
      >
        Add Card
      </Button>
      {cards.map((element, index) => {
        return (
          <Draggable
            id={element.id}
            style={{ margin: "8px" }}
            cardIndex={index}
            colIndex={props.colIndex}
            deleteCard={props.deleteCard}
            saveCard={props.saveCard}
            key={uuidv4()}
            show={show}
            handleModalClose={hideModal}
            handleModalOpen={showModal}
          >
            <Card
              card={element}
              columnid={props.colid}
              key={uuidv4()}
              shared={props.shared}
              deleteCard={props.deleteCard}
              cardIndex={index}
              colIndex={props.colIndex}
              assignToCard={props.assignToCard}
            />
          </Draggable>
        );
      })}
      {props.children}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    userprofile: { ...state.user },
    currentDashboard: state.currentDashboard,
  };
};

export default connect(mapStateToProps)(Column);
