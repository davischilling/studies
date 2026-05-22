const cat = {
	name: "Fluffy",
	dance: function(style = "Tango"){
		return `My cat name is ${this.name} and I like to ${style}`
	}
}
cat.name; // 'Fluffy'
cat.dance(); //' My cat name is Fluffy and I like to Tango'
let cDance = cat.dance;
cDance(); //' My cat name is  and I like to Tango'