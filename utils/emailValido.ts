
export = function emailValido(email: string): boolean {
	if (!email)
		return false;

	let arroba = email.indexOf("@");
	let arroba2 = email.lastIndexOf("@");
	let ponto = email.lastIndexOf(".");

	return (arroba > 0 && ponto > (arroba + 1) && ponto !== (email.length - 1) && arroba2 === arroba);
}
