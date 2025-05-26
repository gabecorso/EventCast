# Event Cast, a weather app for planning outdoor meetups

# Project Overview

This repo is a react and typescript app to allow users to check the weather for a day of the week on a repeating basis to plan for outdoor meetups. The application enables users to make informed decisions about event scheduling by providing comparative weather data across consecutive weeks, with particular emphasis on typical meetup timeframes. The point of this app was to spend no more than approx. 6 hours in the IDE, with two days of prior planning to demonstrate thoughtful technical architecture, user-centric design, and pragmatic engineering decisions within a rapid development context.

# Technical Architecture and Design Decisions
## Core Technology Stack

The application leverages Create React App with the Typescript template as its foundation, chosen for its robust ecosystem and alignment with modern frontend development practices. I implemented a comprehensive state management solution using React Context to achieve  predictable state updates while avoiding the complexity overhead of external state management libraries for this scope of project.

For data visualization, I used Recharts as the primary charting library, selected for its declarative API that aligns naturally with React's component model and its excellent responsive behavior out of the box. This choice enables rapid development of the core weather visualizations including temperature trends, precipitation probability charts, and wind speed. 

# Design System and Styling Architecture
The visual design leverages Font Awesome Pro and an extension of React Bootstrap to fit the needs of the project as its iconographic foundation, extending this modern framework with a custom weather-specific design system implemented in Sass/SCSS. This approach demonstrates awareness of cutting-edge design resources while providing the flexibility needed for weather-specific customizations. My design system employs CSS custom properties for dynamic theming based on time of day, enabling smooth transitions between different weather conditions and times of day.


The styling architecture follows a modular approach with dedicated Sass partials for variables, mixins, base styles, and component-specific styles. This structure facilitates rapid iteration while maintaining consistency across the application. We implement a mobile-first responsive design strategy, ensuring the application performs excellently across all device types—a crucial consideration for users who may need to check weather conditions while coordinating outdoor events.

# API Integration Strategy
The application integrates with the Visual Crossing Timeline Weather API through a dedicated service layer that abstracts API complexity from the React components. This service layer implements robust error handling,debouncing, and response caching to minimize redundant API calls. The architecture anticipates real-world scenarios such as network failures, rate limiting, and malformed responses.

We retrieve weather data using an efficient single-request strategy that fetches 28 days of forecast data, parsing this into current week and next week datasets. This approach minimizes API calls while providing all necessary data for the comparative interface. The service layer also implements data transformation logic that converts raw API responses into application-specific data structures optimized for our visualization needs.


# Component Architecture
The application follows a hierarchical component structure that promotes reusability and maintainability. The root App component manages global application state and provides context to child components. The Header component houses location selection, day picking, and time range selection functionality, implemented as controlled components that update global state.

The main content area features a WeatherComparison component that orchestrates the side-by-side weekly view. Each WeekView component operates independently, receiving its data through props while managing its own local UI state for interactions like expanded hourly details. This separation of concerns ensures that global state remains minimal while component-specific interactions remain responsive.
Weather data visualization components are built as pure functional components using React.memo for optimization. These components receive processed weather data and render it using Recharts. Custom hooks abstract common weather calculation logic, such as determining weather suitability scores based on temperature, precipitation, and wind conditions.

# Development Approach and Timeline
The project follows a phased development approach designed to maximize productivity within the 4-8 hour timeframe. Phase one focused on establishing the development environment, implementing core API integration, and creating the basic application structure. This foundation phase ensures that subsequent development can proceed smoothly without infrastructure concerns.

Phase two introduced the primary UI components and layout implementation. During this phase, I extend the responsive Bootstrap grid system, implement the location and time selection interfaces, and create the basic weekly comparison view. This phase prioritizes functional completeness over visual polish, ensuring core features work correctly before enhancement.

Phase three adds data visualization capabilities and weather assessment logic. This phase sees the implementation of our Recharts-based visualizations. We also implement the weather suitability calculations that help users make informed decisions about their events.\

The final phase focuses on polish, comprehensive error handling, and responsive design refinement. This includes implementing loading states, error boundaries, and ensuring smooth animations and transitions. Final testing across different devices and browsers ensures a professional, production-ready presentation.

# Future Considerations
While the current implementation fulfills an MVP, the architecture supports several natural extensions. The location system could expand to support saving favorite locations or detecting user location automatically, and autocomplete. The weather suitability algorithm could become configurable, allowing different types of outdoor activities to have different thresholds. Historical weather data could enable users to understand typical conditions for their chosen day and time.

Additional D3.js visualizations could provide innovative ways to understand weather patterns. D3 would require significant integration but the long term extensibility and customization would warrant the up-front time investment. The component architecture would easily accommodate new chart types or alternative data presentations. The design system's variable-based approach enables easy theming for different organizations or event types.

# Challenges Faced During Development
1. Lots of data from the API to safely parse and format to create a comprehensive weather report for the user, significant time in planning phase before coding needed to be spent to ensure a proper approach aware of the API constraints before UI code could be made to look prettier.
2. The Weather API only allows hourly data 15 days from the current day, meaning line graphs for hourly breakdowns are not possible more than two weeks in the future in some cases, to handle this I created a simplified weather card that does not display an hourly line graph when moving further into the future.
3. Mobile responsiveness requires adjusting the UI to handle only displaying a single graph in view at one time, resulting in some front end checks for isMobile to ensure we are formatting our data for the weekly report graphs properly when on mobile, as clicking the next arrow in this case does not iterate two weeks in the future, but only one.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
