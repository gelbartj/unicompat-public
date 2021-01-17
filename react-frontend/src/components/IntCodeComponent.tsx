import React from "react";
import { Redirect, useParams } from "react-router";

interface IntCodeProps {
    intCode: string
}

export const IntCodeComponent = () => {
    const { intCode } = useParams<IntCodeProps>();
    return (
    <Redirect to={`/${parseInt(intCode, 10).toString(16).toUpperCase()}`} />
    );
}