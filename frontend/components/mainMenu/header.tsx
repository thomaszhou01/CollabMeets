import AuthTest from '../auth/authTest';

function Header() {
	return (
		<div className="flex justify-between w-full">
			<p>Meets</p>
			<AuthTest />
		</div>
	);
}

export default Header;
