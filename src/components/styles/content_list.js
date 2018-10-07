import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    // the margin between left and right is too close. using `flex: 0` to remove extra space at
    // right.
    itemRight: {
        flex: 0
    }
});
