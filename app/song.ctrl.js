function SongController($scope, SongSvc, LineSvc, UserSvc, WebsocketSvc) {
    this.songSvc = SongSvc;
    this.userSvc = UserSvc;
    this.lineSvc = LineSvc;
    this.websocketSvc = WebsocketSvc;
    
    WebsocketSvc.subscribe("line.add", (data) => {
        if (data.song_id === SongSvc.selectedSong._id) {
            SongSvc.selectedSong.lyrics.splice(data.position, 0, data.line);
            $scope.$apply();
        }
    })
    
    WebsocketSvc.subscribe("line.update", (data) => {
        if (data.song_id === SongSvc.selectedSong._id) {
            SongSvc.selectedSong.lyrics.filter((line) => line._id === data.line._id).forEach((line) => {
                line.text = data.line.text;
                line.editor = data.username;
            });
            $scope.$apply();
        }
    })
    
    WebsocketSvc.subscribe("line.save", (data) => {
        if (data.song_id === SongSvc.selectedSong._id) {
            SongSvc.selectedSong.lyrics.filter((line) => line._id === data.line_id).forEach((line) => line.editor=false);
            $scope.$apply();
        }
    })
    
    WebsocketSvc.subscribe("line.delete", (data) => {
        if (data.song_id === SongSvc.selectedSong._id) {
            SongSvc.selectedSong.lyrics = SongSvc.selectedSong.lyrics.filter((line) => line._id !== data.line_id);
            $scope.$apply();
        }
    })
}

SongController.prototype = {
    get selectedSong() {
        return this.songSvc.selectedSong;
    },
    set selectedSong(song) {
        this.songSvc.selectedSong = song;
    },
    addLine: function (iPosition) {
        var line = {
            tex: "",
            dirty: true
        };
        setTimeout(function () {
            document.getElementById("line_" + iPosition).focus();
        }, 100)
        this.songSvc.selectedSong.lyrics.splice(iPosition, 0, line);
        this.lineSvc.add(this.songSvc.selectedSong._id, {
                position: iPosition
            })
            .then(function (response) {
                line._id = response._id;
                line.dirty = false;
            });
    },
    
    changeLine: function(e, line, index) {
        if (e.keyCode === 13 )
        {
            this.addLine(index+1)
        }
        else {
            this.websocketSvc.send("line.update", {
                song_id: this.songSvc.selectedSong._id,
                line: line,
                username: this.userSvc.currentUser
            })
        }
    },
    
    updateLine: function (line) {
        this.lineSvc.update(this.songSvc.selectedSong._id, line)
            .then(function (response) {
                line.dirty = false;
            })
    },

    deleteLine: function (line, iPosition) {
        this.lineSvc.delete(this.songSvc.selectedSong._id, line)
            .then((response) => {
                this.songSvc.selectedSong.lyrics.splice(iPosition, 1);
            })
    },

    saveLines: function () {
        var that = this;
        this.songSvc.selectedSong.lyrics.forEach(function (line) {
            if (line.dirty) {
                that.updateLine(line);
            }
        })
        this.flags.editSong = false;
    },

    dismissLines: function () {
        var that = this;
        this.songSvc.fetchOne(this.songSvc.selectedSong._id)
            .then(function (song) {
                that.songSvc.selectedSong = song;
                that.flags.editSong = false;
            })
    }
};

angular.module('app')
    .controller('SongCtrl', SongController);
