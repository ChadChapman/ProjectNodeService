@echo off
@echo starting new git run
@git add .
@git commit -m %1
@git push heroku master
@echo ending git run