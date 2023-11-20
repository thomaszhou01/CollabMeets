import UserSignin from '../auth/userSignin';

function Header() {
	return (
		<div className="absolute left-0 top-0 w-full">
			<div className="flex justify-end w-full p-2">
				<UserSignin />
			</div>
		</div>
	);
}

export default Header;
