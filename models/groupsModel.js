const db = require("../db");

class Groups {
    async getAllGroups (req, res, next){
        try {
            const data = await db.any('SELECT * FROM word_groups');
            return res.status(200).send(data)
        } 
        catch(e) {
            return res.status(500).send(e.message)
        }
    }
    async add (req, res, next){
        try {
            if(!req.body.title || !req.body.title_rus){
                throw new Error('Пустые поля в request.body')
            }
            await db.none('INSERT INTO word_groups(title, title_rus, word_ids) VALUES($1, $2, array[]::integer[])', [req.body.title, req.body.title_rus])
            return res.sendStatus(200)
        } 
        catch(e) {
            return res.status(500).send(e.message)
        }
    }
    async getGroupProgress (req, res, next){
        try {
            const vocabulary = await db.one('SELECT english, russian, auding, spelling FROM user_vocabulary WHERE id_user = $1', [req.params.userId]);
            const { word_ids: groupWords } = await db.one('SELECT word_ids FROM word_groups WHERE id = $1', [req.params.groupId]);
            const result = {}
            for(const key in vocabulary){
                const unlerned = groupWords.filter(el => vocabulary[key].includes(el)).length
                result[key] = Math.floor(unlerned / groupWords.length * 100)
            }
    
            return res.status(200).send(result)
        } 
        catch(e) {
            return res.status(500).send(e.message)
        }
    }
    async delete (req, res, next){
        try {
            await db.none('DELETE FROM word_groups WHERE id = $1', [req.body.id])
            return res.sendStatus(200)
        } 
        catch(e) {
            return res.status(500).send(e.message)
        }
    }
    async update (req, res, next){
        try {
            await db.none('UPDATE word_groups SET title = $2, title_rus = $3 WHERE id = $1', [req.body.id, req.body.title, req.body.title_rus])
            return res.sendStatus(200)
        } 
        catch(e) {
            return res.status(500).send(e.message)
        }
    }
    async addWordToGroup (req, res, next){
        try {
            await db.none('UPDATE word_groups SET word_ids = word_ids || $2 WHERE id = $1', [req.body.id, req.body.word_id])
            return res.sendStatus(200)
        } 
        catch(e) {
            return res.status(500).send(e.message)
        }
    }
    async deleteWordFromGroup (req, res, next){
        try {
            await db.none('UPDATE word_groups SET word_ids = array_remove(word_ids, $2) WHERE id = $1', [req.body.id, req.body.word_id])
            return res.sendStatus(200)
        } 
        catch(e) {
            return res.status(500).send(e.message)
        }
    }

}

module.exports = new Groups()