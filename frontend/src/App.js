import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const Signin = lazy(() => import("./components/Signin"));
const Signup = lazy(() => import("./components/Signup"));
const Activate = lazy(() => import('./components/Activate'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));
const Home = lazy(() => import("./components/Home"));
const Cars = lazy(() => import("./components/Cars"));
const Bookings = lazy(() => import("./components/Bookings"));
const Booking = lazy(() => import("./components/Booking"));
const CreateBooking = lazy(() => import("./components/CreateBooking"));
const Settings = lazy(() => import("./components/Settings"));
const Notifications = lazy(() => import("./components/Notifications"));
const Messages = lazy(() => import("./components/Messages"));
const ToS = lazy(() => import("./components/ToS"));
const About = lazy(() => import("./components/About"));
const ChangePassword = lazy(() => import("./components/ChangePassword"));
const Contact = lazy(() => import("./components/Contact"));
const NoMatch = lazy(() => import("./components/NoMatch"));

const App = () => {
	return (
		<Router>
			<div className="App">
				<Suspense fallback={<></>}>
					<Routes>
						<Route exact path="/sign-in" element={<Signin />} />
						<Route exact path="/sign-up" element={<Signup />} />
						<Route exact path='/activate' element={<Activate />} />
						<Route exact path='/reset-password' element={<ResetPassword />} />
						<Route exact path="/" element={<Home />} />
						<Route exact path="/cars" element={<Cars />} />
						<Route exact path="/create-booking" element={<CreateBooking />} />
						<Route exact path="/booking" element={<Booking />} />
						<Route exact path="/bookings" element={<Bookings />} />
						<Route exact path="/settings" element={<Settings />} />
						<Route exact path="/notifications" element={<Notifications />} />
						<Route exact path="/messages" element={<Messages />} />
						<Route exact path="/change-password" element={<ChangePassword />} />
						<Route exact path="/about" element={<About />} />
						<Route exact path="/tos" element={<ToS />} />
						<Route exact path="/contact" element={<Contact />} />

						<Route path="*" element={<NoMatch />} />
					</Routes>
				</Suspense>
			</div>
		</Router>
	);
};

export default App;
