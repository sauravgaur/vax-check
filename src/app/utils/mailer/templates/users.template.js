const header=``;
const footer=`<p>
Regards,<br/>
ED Portal Team
</p>`
function userCreated(title, firstName, lastName, email, phoneNumber, pwd,url){
    let body=`<h2>Welcome Onboard ${title} ${lastName}</h2>
    <p>
    Hello ${firstName}, you are now member of the ED portal below are your login credentials
    </p>
    <ul>
    <li>username :- ${email} or ${phoneNumber}<li>
    <li>password :- ${pwd}<li>
    <li>url :- ${url}<li>
    </ul>
    `;
    return `${header}${body}${footer}`
}
module.exports={
    userCreated
}