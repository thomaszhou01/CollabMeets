import UserSignin from '../auth/userSignin';

function Header() {
	return (
		<div className="absolute left-0 top-0 w-full">
			<div className="flex justify-between w-full">
				<p>Meets</p>
				<UserSignin />
			</div>
		</div>
	);
}

export default Header;
