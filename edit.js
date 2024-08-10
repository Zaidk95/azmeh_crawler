const MyClass = Parse.Object.extend("MyClass");
const query = new Parse.Query(MyClass);
query.get("objectId").then((object) => {
    const originalUpdatedAt = object.get("updatedAt");
    const comment = object.get("comment");
    if(comment == "")
      object.set("comment", "Toxic");
    
    object.save().then((updatedObject) => {
        updatedObject.set("updatedAt", originalUpdatedAt);

        updatedObject.save(null, { useMasterKey: true });
    });
});