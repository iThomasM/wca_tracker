window.onload = function(){
    let wca_id = localStorage.getItem("wca_id");
    let wca_event = localStorage.getItem("wca_event");
    if (wca_id){
        get_data(wca_id, wca_event);
    }else{
        document.getElementById("average").innerText = "Not Found";
    }

}


async function get_data(wca_id, wca_event){
    try{
        const response = await fetch(`https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/persons/${wca_id}.json`);
        if(!response.ok){
            throw new Error("Invalid ID");
        }

        const person = await response.json();
        let solves = get_average(person, wca_event);
        let average = solves[0];
        let count = solves[1];
        let winrate = get_winrate(person, wca_event);
        let best_event = find_best_event(person);
        let podiums = get_podiums(person, wca_event);
        let medals = get_medals(person);
        const averate_header = document.getElementById("average");
        const solve_header = document.getElementById("solve_count");
        const winrate_header = document.getElementById("winrate");
        const best_event_header = document.getElementById("mostlikely");
        const podiums_header = document.getElementById("podiums");
        const medals_header = document.getElementById("medals");
        averate_header.innerText = "Lifetime Average: " + average + "s";
        solve_header.innerText = "Total Solves: " + count;
        winrate_header.innerText = "Winrate: " + winrate + "%";
        best_event_header.innerText = "Most likely to Win: " + best_event;
        podiums_header.innerText = "Event Podiums: " + podiums;
        medals_header.innerText = "Medals: " + medals;
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
    return [average, count];
}

function get_winrate(person, wca_event){

    let comp_count = person.numberOfCompetitions;
    let wins = 0;

    for (let comp of person.competitionIds){
        try{
            let comp_results = person.results[comp][wca_event];
            for (let pos of comp_results){
                if (pos.position === 1){
                    if (pos.round === "Final"){
                        wins++
                    }
                }
            }
        }catch(error){
            console.error(error);
        }
    }
    return Math.round((wins / comp_count) * 100)
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
    let event = Object.keys(winrate_dict).find(key => winrate_dict[key] === max_winrate);
    return event;
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