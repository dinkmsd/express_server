class LedService {
    static async createSchedule(ledID, scheduleInfo){
        await LedInfo.findOneAndUpdate(
            { _id: ledID, },
            {
                $push: {
                    schedule: scheduleInfo,
                },
            },
            { new: true }
        ).then(data => {
            if (data) {
                res.json(data.schedule)
            } else {
                console.log("Khong ton tai")
            }
        }).catch(error => {
            res.status(500).json('Server error')
        })
    }

    static async modifySchedule(){
        
    }

    static async getSchedule(){
        
    }

    static async deleteSchedule(){
        
    }
}