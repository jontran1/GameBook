// Based on https://github.com/ericf/express-handlebars

const express = require('express');
const hb = require('express-handlebars');
const app = express();
app.set('port', (process.env.PORT || 3000));


const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'sh4ob67ph9l80v61.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'icvv21r4rskziu4k',
    password: 'gb3cl5j7lccuy8si',
    database: 'c47ui3axo0ekv6ij'
});


app.engine('handlebars', hb({ defaultLayout: 'index' }));
app.set('view engine', 'handlebars');
app.use(express.urlencoded());

const loggedinAccount = 'iTzjT';

app.get('/', function (req, res) {
    var games;
    const select_game_scores = 'SELECT users.userName, games.gameName, gameUsers.score FROM users natural join gameUsers natural join games order by gameUsers.score desc;';
    connection.query(select_game_scores, (error, usersByScore, fields) => {
        if (error) {
            throw error;
        }
        connection.query('SELECT * FROM games', (error, games, fields) => {
            if (error) {
                throw error;
            }
            res.render('home', { usersByScore, games });
        });
    });

});

//SELECT gameName,b.tHours FROM (SELECT sum(totalHours) as tHours,gameID FROM gameUsers GROUP BY gameID ORDER BY tHours DESC) AS b NATURAL JOIN games; 







app.get('/Players/search', function (req, res) {
    var userName = "";
    const select_players = "SELECT * FROM users natural join usersProfiles WHERE users.userName LIKE '%" + userName + "%';";
    connection.query(select_players, (error, players, fields) => {
        if (error) {
            throw error;
        }
        res.render('playerPage', { 'players': players });
    });
});
app.post('/Players/search', function (req, res) {
    // const rank = req.body.rank;
    const player = req.body.typeahead;
    res.redirect('/Players/search/' + player);

});
app.get('/Players/search/:user', function (req, res) {
    var userName = req.params.user;
    const select_players = "SELECT * FROM users natural join usersProfiles WHERE users.userName LIKE '%" + userName + "%';";
    connection.query(select_players, (error, players, fields) => {
        if (error) {
            throw error;
        }
        res.render('playerPage', { 'players': players });
    });
});
app.get('/Games', function (req, res) {
    let result1, result2;
    connection.query('SELECT * FROM games', (error, results, fields) => {
        if (error) {
            throw error;
        }
        var topGameQuery = 'SELECT gameName,b.tHours FROM (SELECT sum(totalHours) as tHours,gameID FROM gameUsers GROUP BY gameID ORDER BY tHours DESC) AS b NATURAL JOIN games LIMIT 10;';
        connection.query(topGameQuery, (error, gameList, fields) => {
            if (error) {
                throw error;
            }
            res.render('gamePage', { 'games': results, 'gameList': gameList });
        });

    });
});


app.get('/Games/:gameID', function (req, res) {

    const select_game = 'SELECT * FROM games WHERE gameID = ?;';
    const select_top_players = 'SELECT * FROM gameUsers WHERE gameID = ? ORDER BY score DESC LIMIT 10 ;';
    const select_all_players = 'SELECT * FROM usersProfiles NATURAL JOIN gameUsers WHERE gameID = ? ;';
    const select_most_hours = 'SELECT * FROM gameUsers WHERE gameID = ? ORDER BY totalHours DESC LIMIT 10;';

    connection.query(select_game, req.params.gameID, (error, gameInfo, fields) => {
        if (error) {
            throw error;
        }
        connection.query(select_top_players, req.params.gameID, (error, topPlayers, fields) => {
            if (error) {
                throw error;
            }
            connection.query(select_all_players, req.params.gameID, (error, allPlayers, fields) => {
                if (error) {
                    throw error;
                }

                connection.query(select_most_hours, req.params.gameID, (error, mostHours, fields) => {
                    if (error) {
                        throw error;
                    }

                    res.render('specificGamePage', {
                        'Game': gameInfo[0],
                        'topPlayers': topPlayers,
                        'mostHours': mostHours,
                        'AllPlayers': allPlayers
                    });
                });
            });
        });


    });




});



app.get('/gamePage.css', function (req, res) {
    res.sendFile(__dirname + '/css/gamePage.css')
});

app.get('/specificGamePage.css', function (req, res) {
    res.sendFile(__dirname + '/css/specificGamePage.css')
});

app.get('/css/home.css', function (req, res) {
    res.sendFile(__dirname + '/css/home.css')
});

app.get('/api/allclan', (req, res) => {
    const select_all_clan = 'SELECT * FROM teamUser ORDER BY clanName;';
    connection.query(select_all_clan, (error, results, fields) => {
        if (error) {
            throw error;
        }
        res.render('allclan', { results });
    });
});
app.get('/css/allclan.css', function (req, res) {
    res.sendFile(__dirname + '/css/allclan.css')
});

app.get('/api/clanpage/:clan', (req, res) => {
    const select_users = "SELECT * FROM teamUser WHERE clanName = '" + req.params.clan + "' ORDER BY clanRank;";
    connection.query(select_users, (error, results, fields) => {
        if (error) {
            throw error;
        }
        res.render('allclan', { results });
    });
});

app.get('/api/create_clan_form', (req, res) => {
    res.render('createclanform');
});

app.post('/api/createclan', (req, res) => {
    const user = req.body.user;
    const clan = req.body.clan;
    const game = req.body.game;
    const rank = req.body.rank;
    const description = req.body.description;
    // create table teamUser(clanName varchar(127), userName varchar(127), clanRank varchar(127));
    const statement1 = 'insert into team (clanName, clanDesc) values (?, ?);';
    const statement2 = 'insert into teamUser (clanName, userName, clanRank) values (?, ?, ?);';
    const statement3 = 'INSERT INTO clanList (Clan, userName) VALUES (?, ?);';
    // const statement = 'INSERT INTO team (Clan, User, Game, Role) VALUES (?, ?, ?, ?);';

    connection.query(statement1, [clan, description], (error, results, fields) => {
        if (error) {
            throw error;
        }
        console.log(`Clan: ${clan} is created succesfully.`);
        // res.redirect('/api/allclan');
    });

    connection.query(statement3, [clan, user], (error) => {
        if (error) {
            throw error;
        }
        console.log(`User: ${user} is created succesfully.`);
        res.redirect('/api/allclan');
    });

    // connection.query(statement2, [clan, user, rank], (error) => {
    //     if (error) {
    //         throw error;
    //     }
    //     console.log(`User: ${user} is created succesfully.`);
    //     res.redirect('/api/allclan');
    // });
});


//Jon's Code

const myProfile = "select distinct * from users natural join usersProfiles natural join gameUsers, games where users.userName='itzjt' and gameUsers.gameID = games.gameID;"
app.get('/user/myprofile', function (req, res) {
    connection.query(myProfile, (error, results, fields) => {
        if (error) {
            throw error;
        }
        console.log(results);
        console.log('My Profile has been loaded...')
        res.render('mainProfilePage', { results });
    });

});
app.get('/user/myprofile/friendslist', function (req, res) {
    const viewFriendsandPictures = "select distinct profilePictures, userFriend from friends, usersProfiles where friends.userName = 'iTzjT' and usersProfiles.userName = friends.userFriend;"
    connection.query(viewFriendsandPictures, (error, results, friends) => {
        if (error) {
            throw error;
        }
        console.log(results);
        console.log("My friends list has loaded...")
        res.render("mainProfilefriendsList", { results });
    })
});

const viewFriends = 'select userFriend from friends where userName = "iTzjT";';

app.get('/user/:userName/friendslist', function (req, res) {
    const viewFriendsandPictures = "select distinct profilePictures, userFriend from friends, usersProfiles where friends.userName = '" + req.params.userName + "' and usersProfiles.userName = friends.userFriend;"
    connection.query(viewFriendsandPictures, (error, results, friends) => {
        if (error) {
            throw error;
        }
        console.log(results);
        console.log("My friends list has loaded...")
        res.render("friendsList", { results });
    })
});

// Bon
app.get('/user/:userName/clanPage', function (req, res) {
    var userName = req.params.userName;
    const userProfile = "SELECT * FROM teamUser WHERE clanName = (SELECT clanName FROM teamUser WHERE userName = '" + userName + "');";
    connection.query(userProfile, (error, results, fields) => {
        if (error) {
            throw error;
        }
        console.log(results);
        // res.render('otherProfiles', { results });
        res.render('allclan', { results });
    })
});



app.get('/user/:userName', function (req, res) {
    var userName = req.params.userName;
    const userProfile = "select distinct * from users natural join usersProfiles natural join gameUsers, games where users.userName='" + userName + "' and gameUsers.gameID = games.gameID;"

    connection.query(userProfile, (error, results, fields) => {
        if (error) {
            throw error;
        }
        res.render('otherProfiles', { results });
    })
});
app.get('/user/:userName/addfriend', function (req, res) {
    userFriend = req.params.userName;
    const addfriend_query = "CALL addingFriends (?,?)";

    try {
        connection.query(addfriend_query, [loggedinAccount, userFriend], (error, results, fields) => {
            if (error) {
                throw error;
            }
            res.redirect('/user/' + req.params.userName);

        })
    } catch (error) {
        console.log(error);
        res.redirect('/user/' + userFriend);
    }
});
app.get('/user/:userName/removeFriend', function (req, res) {
    userFriend = req.params.userName;
    const addfriend_query = "CALL removingFriends(?,?)";
    connection.query(addfriend_query, [loggedinAccount, userFriend], (error, results, fields) => {
        if (error) {
            throw error;
        }
        console.log('Friend removed lol bye bye');
        res.redirect('/user/myprofile/friendslist');
    })
});
app.get('/user/:userName/addClanMember', function (req, res) {
    // const addfriend_query = "insert into teamUser values('Red','" + req.params.userName + "', 'Member');"
    const addfriend_query = "CALL addClanMember('Red', '" + req.params.userName + "');"
    connection.query(addfriend_query, (error, results, fields) => {
        if (error) {
            throw error;
        }
        console.log('it worked LOL.....');
        res.redirect('/user/' + req.params.userName);
    })
});



app.listen(process.env.PORT || 3000);
