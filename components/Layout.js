import React, { Component } from "react"
import styled from "styled-components"

const Logo = styled.h1`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
`

const HorizontalMenu = styled.div`
  display: flexbox;
  flex-direction: row;
`

const MenuItem = styled.h2`
  margin-right: 2em;
`

const Layout = ({ children }) => (
  <div>
    <Logo>Mahmoud Saada</Logo>
    <HorizontalMenu>
      <MenuItem>Menu 1</MenuItem>
      <MenuItem>Menu 2</MenuItem>
      <MenuItem>Menu 3</MenuItem>
      <MenuItem>Menu 4</MenuItem>
    </HorizontalMenu>
    {children}
  </div>
)

export default Layout
