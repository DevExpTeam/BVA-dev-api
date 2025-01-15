const { auth } = require("../firebase");
const { User } = require("../models");

const verifyToken = async (req, res, next) => {
  try {
    const userinfoHeader = req.header("X-Apigateway-Api-Userinfo");
    let userId = "";
    if (!userinfoHeader) {
      // return res.status(401).json({ error: 'Authorization header missing' });
      const token = req.headers.authorization?.split("Bearer ")[1];
      if (!token) {
        return res.status(401).send({ error: "No token provided" });
      }

      const decodedToken = await auth.verifyIdToken(token);

      if (!decodedToken) {
        console.error("idToken is missing");
        return res
          .status(401)
          .json({ error: "Access Denied: idToken is missing" });
      }
      userId = decodedToken.uid;
      req.userId = decodedToken.uid;
      req.email = decodedToken.email;
      if (decodedToken?.role === "admin") {
        return next();
      }
    } else {
      console.log(userinfoHeader);
      // The header is base64url encoded, so decode it
      // const jwtPayloadBase64 = userinfoHeader.split('.')[1];
      const jwtPayloadBase64 = userinfoHeader;
      console.log("jwtPayloadBase64", jwtPayloadBase64);
      const decodedJwtPayload = Buffer.from(
        jwtPayloadBase64,
        "base64"
      ).toString("utf-8");
      console.log("decodedJwtPayload", decodedJwtPayload);

      // Parse the JWT payload JSON string to an object
      const jwtPayload = JSON.parse(decodedJwtPayload);
      // Now you can use the JWT payload object as needed
      // res.json({ jwtPayload });
      console.log("JWTPayload", jwtPayload);

      userId = jwtPayload.user_id;
      req.userId = jwtPayload.user_id;
      req.email = jwtPayload.email;
    }

    try {
      const isActive = await User.isUserActive(userId);
      if (!isActive) {
        return res.status(401).send({
          error:
            "Access Denied: Please subscribe to a plan to access this feature.",
        });
      }
      next();
    } catch (error) {
      console.log("error", error);
      return res.status(401).send({ error: "Unauthorized" });
    }
  } catch (error) {
    if (error.code === "auth/id-token-expired") {
      return res
        .status(401)
        .send({ message: "Token expired. Please refresh your token." });
    } else {
      // Handle other errors
      console.log("Unexpected error");
      console.log(error);
      return res
        .status(400)
        .send({ message: "Unexpected error." });
    }
  }
};

const verifyAdmin = async (req, res, next) => {
  const user = await auth().getUser(req.userId);
  if (user.customClaims && user.customClaims.admin === true) {
    return next();
  }
  return res.status(403).send({ error: "Forbidden" });
};

module.exports = { verifyToken, verifyAdmin };
