import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Modal.css';
import  { connect } from 'react-redux';
import * as action from "../../utils/actions";

function Draggable(props) {
    const showHideClassName = props.show
        ? 'modal display-block'
        : 'modal display-none';
    const { dispatch, userprofile } = props;
    
    function drag(e) {
        e.dataTransfer.setData('transfer', e.target.id);
    }

    function noAllowDrop(e) {
        e.stopPropagation();
    }

    function saveCard(cardid, colIndex, cardIndex) {
        const title = document.getElementById("title" + cardid)
          ? document.getElementById("title" + cardid)
          : "";
        const description = document.getElementById("desc" + cardid)
          ? document.getElementById("desc" + cardid)
          : "";
        const date = document.getElementById("date" + cardid)
          ? document.getElementById("date" + cardid)
          : "";
        const updatedCard = {
          title: title.value ? title.value : "",
          id: cardid,
          duedate: date.value ? date.value : "",
          lables: ["Important", "Medium", "Low"],
          description: description.value ? description.value : "",
          asignee: [""],
        };
        
        dispatch(action.updateCard({ updatedCard, colIndex, cardIndex }))
        dispatch(action.updateUserProfile(userprofile));
      }

    return (
        <div
            data-colIndex={props.colIndex}
            data-cardIndex={props.cardIndex}
            id={props.id}
            draggable="true"
            onDragStart={drag}
            onDragOver={noAllowDrop}
            style={props.style}
            onBlur={() => saveCard(props.id, props.colIndex, props.cardIndex)}
        >
        {props.children}
        </div>
    );
}

Draggable.propTypes = {
    id: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
};

const mapStateToProps = (state) => {
     return {
        userprofile: {...state.user}
     }
}
export default connect(mapStateToProps)(Draggable);
