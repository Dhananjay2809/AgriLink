1. I have created the mostly reoutes of the Backend and it works i tested sucessfully in the Postman and store the data in the mongoDB
2. I built the responsive UI Frontend which works better
3. I also connected the Frontend with the Backend so the frontend send the request to the backend , ans generate the response from the backend.
4. Like when i login in to my website , the user login info checks in the database, if the information is present in the database, login successfull , otherwise it sends the invalid credintials.
5. If the user send the follow request to the other user , by simply search from the search box , and the cancel the request , other user accept the request , and reject the request.
6. When the request is accepted , it automatically upadates the followers and the following of the user.
7. And user check hs profile and the edit the profile and also add his profile pic, and delete his profile pic. Ans also user create the posts , it is add in the db, and the image and the video , is upload to the directly CLoudinary , and it genreates the cloudinary link of the image and it stores in the mongoDB
8. Now i deploy this website on the AWS. and add the new features after that(live chat by the websocket, and notification method , call method, and the otp method, and the map method , to find the location from the device)



Deployment Notes Here on the AWS
1. Signup on the AWS
2. Launch instance 
3. Generate the secret key
4. chmod 400 <secret>.pem
5. connecting to the machin by use of the ssh

// Notes : Now we open the online machine which have its own memory, own ram and its own operating system which is host on the cloud AWS
6. now install the node in the cloud machine as the same version
// And the version of the node on the local machine and the cloud machine is same, otherwise it definitely shows the error to connect
8. To logout from the machine  need "exit" keywords in the their terminal
   // and again login to the machine by the ssh commands
   // ls is used to check the list of the item on the machine 
   // this machine is run on the ubuntu linux system
7. Now extract the code from the github (by git clone and the link of the backend code)

// Now i deploy the backend and the Frontend separately
8. First i deploy the frontend by using the vite
9. on the server and the local server we run the command (npm run build) which creates the dist folder , in this folder we have the all our frontend production code 
10. npm install in the cloude machine
11. sudo apt update (it updates our machine and the all the dependicies)
12. to run and deploy the frontend we install the nginx
13. sudo apt install nginx 
14. sudo systemctl start nginx
15. sudo systemcgl enable nginx
16. and now copy the code from th dist folder (builf files) /var/www/html
17. sudo scp -r dist/* var/www/html  (this command all the files )
18. now copy the public and it runs (but enable the port: 80 of your instance )


Now Backend deploy Noted on the AWS
1. First install the dependecies like npm init
2. Connect the mongoDB database to the AWS machine to their address (by the establish connection from the atlas)
3. ANd now the command (npm start or npm run start) to rum at the production level
4. And set the port number in the security section
5. By this porcess , after sometime the backend server automatically closed , it is not run 24/7 live.
6. To run the server 24/7 live we use the package pm2 so install pm2 (npm i pm2 -g)
7.  Now run the command to live the backend server 24/7 (pm2 start npm -- start)
8. To check the logs  if any error occurs (pm2 logs) ,, to cear the logs (pm2 flush npm)
9. pm2 flush <name> , pm2 list , pm2 stop<name>, pm2 delete <name>
10. To give the customised name to the application instead of npm , run the following command
     (pm2 start npm -- name "AgriLink-backend" -- start)

Now Both Frontend and Backend is running separately , now merge both of them
1. 
