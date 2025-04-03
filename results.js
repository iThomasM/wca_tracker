let wca_id = localStorage.getItem("wca_id");
let wca_event = localStorage.getItem("wca_event");
window.onload = function(){
    if (wca_id){
        get_data(wca_id, wca_event);
    }else{
        document.getElementById("average").innerText = "Not Found";
    }

}

document.getElementById("submit").onclick = function(){
    secondary = document.getElementById("secondary").value;
    let seconday_data = get_data(secondary, wca_event);
}

let event_dict = {
    "333": "3x3", "222": "2x2", "444": "4x4", "555": "5x5", "666": "6x6", "777": "7x7",
    "skewb": "Skewb", "pyram": "Pyraminx", "333bf": "3BLD", "sq1": "Sq-1",
}

async function get_data(wca_id, wca_event){
    try{
        const response = await fetch(`https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/persons/${wca_id}.json`);
        if(!response.ok){
            throw new Error("Invalid ID");
        }

        const person = await response.json();
        const name = person.name
        const country = person.country
        let solves = get_average(person, wca_event);
        let average = solves[0];
        let count = solves[1];
        let winrate = get_winrate(person, wca_event);
        let best_event = find_best_event(person);
        let podiums = get_podiums(person, wca_event);
        let medals = get_medals(person);
        if (wca_id === localStorage.getItem("wca_id")){
            const average_header = document.getElementById("average");
            const solve_header = document.getElementById("solve_count");
            const winrate_header = document.getElementById("winrate");
            const best_event_header = document.getElementById("mostlikely");
            const podiums_header = document.getElementById("podiums");
            const medals_header = document.getElementById("medals");
            const name_header = document.getElementById("name");
            const country_header = document.getElementById("country");
            const selected_event_header = document.getElementById("selected_event");
            average_header.innerText = "Lifetime Average: " + average + "s";
            solve_header.innerText = "Total Solves: " + count;
            winrate_header.innerText = "Winrate: " + winrate + "%";
            best_event_header.innerText = "Most likely to Win: " + event_dict[best_event];
            podiums_header.innerText = "Event Podiums: " + podiums;
            medals_header.innerText = "Medals: " + medals;
            name_header.innerText = name;
            country_header.innerText = country;
            selected_event_header.innerText = event_dict[wca_event];
        }else{
            const average2_header = document.getElementById("average2");
            const solve2_header = document.getElementById("solve_count2");
            const winrate2_header = document.getElementById("winrate2");
            const best2_event_header = document.getElementById("mostlikely2");
            const podiums2_header = document.getElementById("podiums2");
            const medals2_header = document.getElementById("medals2");
            const name2_header = document.getElementById("name2");
            const country2_header = document.getElementById("country2");
            average2_header.innerText = `Average: ` + average + "s";
            solve2_header.innerText = `Total Solves: ` + count;
            winrate2_header.innerText = `Winrate: ` + winrate + `%`;
            best2_event_header.innerText = `Most likely to Win: ` + event_dict[best_event];
            podiums2_header.innerText = `Event Podiums: ` + podiums;
            medals2_header.innerText = `Medals: ` + medals;
            name2_header.innerText = person.name;
            country2_header.innerText = person.country;
        }
    }
    catch(error){
        console.error(error);
    }
}

function get_average(person, wca_event){
    let sum = 0;
    let average;
    let count;
    let solve_arr = [];
    for (let comp of person.competitionIds){
        try{
            let comp_results = person.results[comp][wca_event];
            for (let result of comp_results){
                let solves = result.solves;
                for (let solve of solves){
                    if (solve > 0){
                        sum += solve / 100;
                        solve_arr.push(solve / 100);
                    }
                }
            }
        } catch(error){
            console.log(comp, "did not have", wca_event);
            continue;
        }
    }
    count = solve_arr.length;
    average = sum / count
    average = Math.round(average * 10) / 10;
    average = convert_seconds(average);
    return [average, count];
}

function get_winrate(person, wca_event){

    let comp_count = 0;
    let wins = 0;

    for (let comp of person.competitionIds){
        try{
            let comp_results = person.results[comp][wca_event];
            comp_count++;
            for (let pos of comp_results){
                if (pos.position === 1){
                    if (pos.round === "Final"){
                        wins++;
                    }
                }
            }
        }catch(error){
            console.error(error);
        }
    }
    if (wins > 0){
        return Math.round((wins / comp_count) * 100);
    }
    return 0;
}

function find_best_event(person){
    const event_list = ['222', '333', '444', '555', '666', '777',
        'minx', 'pyram', 'sq1', 'clock', 'skewb',
        '333oh', '333bf', '444bf', '555bf'];
    let winrate_dict = {};
    for (let event of event_list){
        let event_winrate = get_winrate(person, event);
        winrate_dict[event] = event_winrate;
    }
    let arr = Object.values(winrate_dict);
    let max_winrate = Math.max(...arr)
    if (max_winrate > 0){
        let event = Object.keys(winrate_dict).find(key => winrate_dict[key] === max_winrate);
        return event;   
    }
    return "N/A";

}

function get_podiums(person, event){
    let podiums = 0;
    for (let comp of person.competitionIds){
        try{
            let comp_results = person.results[comp][event];
            for (let pos of comp_results){
                if (pos.position <= 3){
                    if (pos.round === "Final"){
                        podiums++
                    }
                }
            }
        }catch(error){
            console.error(error);
        }
    }
    return podiums;
}

function get_medals(person){
    let medals = 0;
    let arr = Object.values(person.medals);
    for (let i of arr){
        medals += i;
    }
    return medals;
}

function convert_seconds(time){
    let mins = 0;
    let seconds = time;
    while (time > 59){
        if (time >= 60){
            if (seconds - 60 < 0){
                break;
            }else{
                seconds -= 60;
            }
            mins ++;
        }
    }
    if (mins === 0){
        return time;
    }
    if (seconds < 10){
        seconds = "0" + Math.round(seconds);
    }else{
        seconds = Math.round(seconds);
    }
    return `${mins}:${seconds}`
}
