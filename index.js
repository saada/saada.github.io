import React, { Component } from "react"
import { createRoot } from "react-dom/client"
import Home from "./components/Home"

const root = createRoot(document.getElementById("react-container"))
root.render(<Home />)
