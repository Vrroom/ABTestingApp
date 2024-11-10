import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SlideGroup from "./slidegroup";
import Intro from "./intro";
import Tutorial from "./tutorial";
import Nav from "./nav";
import Survey from "./survey";
import TextSurvey from "./textsurvey";
import GroupUI from "./groupui";
import Comments from "./comments";
import TaskIntro from "./taskintro";
import Task from "./task"; 

function Slides(props) {
        // <Tutorial />
  return (
    <>
      <Nav />
      <SlideGroup>
        <Task taskNum={0} />
        <Task taskNum={1} />
        <Task taskNum={2} />
        <Task taskNum={3} />
        <Task taskNum={4} />
        <Task taskNum={5} />
        <Task taskNum={6} />
        <Task taskNum={7} />
        <Task taskNum={8} />
        <Task taskNum={9} />
        <Task taskNum={10} />
        <Task taskNum={11} />
        <Task taskNum={12} />
        <Task taskNum={13} />
        <Task taskNum={14} />
        <Task taskNum={15} />
        <Task taskNum={16} />
        <Task taskNum={17} />
        <Task taskNum={18} />
        <Task taskNum={19} />
        <Task taskNum={20} />
        <Task taskNum={21} />
        <Task taskNum={22} />
        <Task taskNum={23} />
        <Task taskNum={24} />
        <Task taskNum={25} />
        <Task taskNum={26} />
        <Task taskNum={27} />
        <Task taskNum={28} />
        <Task taskNum={29} />
        <TextSurvey />
      </SlideGroup>
    </>
  );
}


export default Slides;
